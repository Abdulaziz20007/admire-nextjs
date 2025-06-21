import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Teacher } from '@/db/models';

/**
 * Individual teacher management endpoints
 * GET /api/admin/teachers/[id] - Get specific teacher (Content Access or higher)
 * PUT /api/admin/teachers/[id] - Update specific teacher (Content Access or higher)
 * DELETE /api/admin/teachers/[id] - Delete specific teacher (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Teacher ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid teacher ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getTeacher(req, res, id);
      case 'PUT':
        return await updateTeacher(req, res, id);
      case 'DELETE':
        return await deleteTeacher(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Teacher operation failed');
  }
}

/**
 * Get specific teacher
 */
async function getTeacher(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const teacher = await Teacher.findById(toObjectId(id))
    .populate('avatar', 'url alt_text');
  
  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    teacher.toJSON(),
    'Teacher retrieved successfully'
  ));
}

/**
 * Update specific teacher
 */
async function updateTeacher(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Check if teacher exists
  const teacher = await Teacher.findById(toObjectId(id));
  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }
  
  // Update teacher
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  ).populate('avatar', 'url alt_text');
  
  return res.status(200).json(createSuccessResponse(
    updatedTeacher?.toJSON(),
    'Teacher updated successfully'
  ));
}

/**
 * Delete specific teacher
 */
async function deleteTeacher(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if teacher exists
  const teacher = await Teacher.findById(toObjectId(id));
  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }
  
  // Delete teacher
  await Teacher.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Teacher deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
