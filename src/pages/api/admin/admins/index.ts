import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Admin } from '@/db/models';
import { IAdmin } from '@/types/database';

/**
 * Admin management endpoints
 * GET /api/admin/admins - Get all admins (Super Admin only)
 * POST /api/admin/admins - Create new admin (Super Admin only)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getAdmins(req, res);
      case 'POST':
        return await createAdmin(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Admin operation failed');
  }
}

/**
 * Get all admins with pagination and filtering
 */
async function getAdmins(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { surname: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.priority) {
    query.priority = filter.priority;
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [admins, total] = await Promise.all([
    Admin.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Admin.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    admins,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Admins retrieved successfully'));
}

/**
 * Create new admin
 */
async function createAdmin(req: AuthenticatedRequest, res: NextApiResponse) {
  const adminData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['name', 'surname', 'username', 'password', 'priority'];
  const missingFields = validateRequiredFields(adminData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Check if username already exists
  const existingAdmin = await Admin.findOne({ 
    username: adminData.username.toLowerCase() 
  });
  if (existingAdmin) {
    return res.status(409).json(createErrorResponse('Username already exists'));
  }
  
  // Validate priority
  const validPriorities = ['0', '1', '2', '3'];
  if (!validPriorities.includes(adminData.priority)) {
    return res.status(400).json(createErrorResponse('Invalid priority level'));
  }
  
  // Create new admin
  const newAdmin = new Admin({
    name: adminData.name,
    surname: adminData.surname,
    username: adminData.username.toLowerCase(),
    password: adminData.password, // Will be hashed by pre-save middleware
    priority: adminData.priority,
    avatar: adminData.avatar || undefined
  });
  
  await newAdmin.save();
  
  return res.status(201).json(createSuccessResponse(
    newAdmin.toJSON(),
    'Admin created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.FULL_ACCESS)(handler));
