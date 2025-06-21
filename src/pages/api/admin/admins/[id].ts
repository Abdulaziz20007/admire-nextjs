import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Admin } from '@/db/models';

/**
 * Individual admin management endpoints
 * GET /api/admin/admins/[id] - Get specific admin (Super Admin only)
 * PUT /api/admin/admins/[id] - Update specific admin (Super Admin only)
 * DELETE /api/admin/admins/[id] - Delete specific admin (Super Admin only)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Admin ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid admin ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getAdmin(req, res, id);
      case 'PUT':
        return await updateAdmin(req, res, id);
      case 'DELETE':
        return await deleteAdmin(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Admin operation failed');
  }
}

/**
 * Get specific admin
 */
async function getAdmin(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const admin = await Admin.findById(toObjectId(id)).select('-password');
  
  if (!admin) {
    return res.status(404).json(createErrorResponse('Admin not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    admin.toJSON(),
    'Admin retrieved successfully'
  ));
}

/**
 * Update specific admin
 */
async function updateAdmin(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Check if admin exists
  const admin = await Admin.findById(toObjectId(id));
  if (!admin) {
    return res.status(404).json(createErrorResponse('Admin not found'));
  }
  
  // Prevent self-deletion or priority change
  if (admin._id.toString() === req.admin.adminId) {
    if (updateData.priority && updateData.priority !== admin.priority) {
      return res.status(403).json(createErrorResponse('Cannot change your own priority level'));
    }
  }
  
  // Check if username is being changed and if it already exists
  if (updateData.username && updateData.username !== admin.username) {
    const existingAdmin = await Admin.findOne({ 
      username: updateData.username.toLowerCase(),
      _id: { $ne: toObjectId(id) }
    });
    if (existingAdmin) {
      return res.status(409).json(createErrorResponse('Username already exists'));
    }
    updateData.username = updateData.username.toLowerCase();
  }
  
  // Validate priority if being updated
  if (updateData.priority) {
    const validPriorities = ['0', '1', '2', '3'];
    if (!validPriorities.includes(updateData.priority)) {
      return res.status(400).json(createErrorResponse('Invalid priority level'));
    }
  }
  
  // Update admin
  const updatedAdmin = await Admin.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  return res.status(200).json(createSuccessResponse(
    updatedAdmin?.toJSON(),
    'Admin updated successfully'
  ));
}

/**
 * Delete specific admin
 */
async function deleteAdmin(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if admin exists
  const admin = await Admin.findById(toObjectId(id));
  if (!admin) {
    return res.status(404).json(createErrorResponse('Admin not found'));
  }
  
  // Prevent self-deletion
  if (admin._id.toString() === req.admin.adminId) {
    return res.status(403).json(createErrorResponse('Cannot delete your own account'));
  }
  
  // Delete admin
  await Admin.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Admin deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.FULL_ACCESS)(handler));
