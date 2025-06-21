import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Phone } from '@/db/models';

/**
 * Web phones management endpoints
 * GET /api/admin/web-phones - Get all phone numbers (Content Access or higher)
 * POST /api/admin/web-phones - Create new phone number (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getPhones(req, res);
      case 'POST':
        return await createPhone(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Phone operation failed');
  }
}

/**
 * Get all phone numbers with pagination and filtering
 */
async function getPhones(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { number: { $regex: search, $options: 'i' } },
      { label: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.is_active !== undefined) {
    query.is_active = filter.is_active === 'true';
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [phones, total] = await Promise.all([
    Phone.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Phone.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    phones,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Phone numbers retrieved successfully'));
}

/**
 * Create new phone number
 */
async function createPhone(req: AuthenticatedRequest, res: NextApiResponse) {
  const phoneData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['number'];
  const missingFields = validateRequiredFields(phoneData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Basic phone number validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phoneData.number.replace(/[\s\-\(\)]/g, ''))) {
    return res.status(400).json(createErrorResponse('Invalid phone number format'));
  }
  
  // Check if phone number already exists
  const existingPhone = await Phone.findOne({ number: phoneData.number });
  if (existingPhone) {
    return res.status(409).json(createErrorResponse('Phone number already exists'));
  }
  
  // Create new phone number
  const newPhone = new Phone({
    number: phoneData.number,
    label: phoneData.label || '',
    is_active: phoneData.is_active !== undefined ? phoneData.is_active : true,
    order: phoneData.order || 0
  });
  
  await newPhone.save();
  
  return res.status(201).json(createSuccessResponse(
    newPhone.toJSON(),
    'Phone number created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
