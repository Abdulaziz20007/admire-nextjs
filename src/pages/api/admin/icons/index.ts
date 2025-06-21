import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Icon } from '@/db/models';

/**
 * Icons management endpoints
 * GET /api/admin/icons - Get all icons (Content Access or higher)
 * POST /api/admin/icons - Create new icon (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getIcons(req, res);
      case 'POST':
        return await createIcon(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Icons operation failed');
  }
}

/**
 * Get all icons with pagination and filtering
 */
async function getIcons(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { url: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.is_active !== undefined) {
    query.is_active = filter.is_active === 'true';
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [icons, total] = await Promise.all([
    Icon.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Icon.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    icons,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Icons retrieved successfully'));
}

/**
 * Create new icon
 */
async function createIcon(req: AuthenticatedRequest, res: NextApiResponse) {
  const iconData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['name', 'url'];
  const missingFields = validateRequiredFields(iconData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate URL format
  try {
    new URL(iconData.url);
  } catch (error) {
    return res.status(400).json(createErrorResponse('Invalid URL format'));
  }
  
  // Check if icon name already exists
  const existingIcon = await Icon.findOne({ name: iconData.name });
  if (existingIcon) {
    return res.status(409).json(createErrorResponse('Icon name already exists'));
  }
  
  // Create new icon
  const newIcon = new Icon({
    name: iconData.name,
    url: iconData.url,
    is_active: iconData.is_active !== undefined ? iconData.is_active : true,
    order: iconData.order || 0
  });
  
  await newIcon.save();
  
  return res.status(201).json(createSuccessResponse(
    newIcon.toJSON(),
    'Icon created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
