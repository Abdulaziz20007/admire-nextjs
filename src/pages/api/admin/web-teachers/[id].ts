import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Web, Teacher } from '@/db/models';

/**
 * Individual web-teacher relationship management endpoints
 * DELETE /api/admin/web-teachers/[id] - Delete specific web-teacher relationship (Content Access or higher)
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
      case 'DELETE':
        return await deleteWebTeacher(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Teacher operation failed');
  }
}

/**
 * Delete specific web-teacher relationship
 */
async function deleteWebTeacher(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if teacher exists
  const teacher = await Teacher.findById(toObjectId(id));
  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }
  
  // Get web configuration
  const webConfig = await Web.findOne();
  if (!webConfig || !webConfig.teachers) {
    return res.status(404).json(createErrorResponse('Web-Teacher relationship not found'));
  }
  
  // Check if relationship exists
  const teacherIndex = webConfig.teachers.findIndex(
    (teacherId: any) => teacherId.toString() === id
  );
  
  if (teacherIndex === -1) {
    return res.status(404).json(createErrorResponse('Web-Teacher relationship not found'));
  }
  
  // Remove teacher from web configuration
  webConfig.teachers.splice(teacherIndex, 1);
  await webConfig.save();
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Web-Teacher relationship deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
