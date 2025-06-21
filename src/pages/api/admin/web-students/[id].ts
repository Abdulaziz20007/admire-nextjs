import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Web, Student } from '@/db/models';

/**
 * Individual web-student relationship management endpoints
 * DELETE /api/admin/web-students/[id] - Delete specific web-student relationship (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Student ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid student ID'));
    }
    
    switch (req.method) {
      case 'DELETE':
        return await deleteWebStudent(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Student operation failed');
  }
}

/**
 * Delete specific web-student relationship
 */
async function deleteWebStudent(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if student exists
  const student = await Student.findById(toObjectId(id));
  if (!student) {
    return res.status(404).json(createErrorResponse('Student not found'));
  }
  
  // Get web configuration
  const webConfig = await Web.findOne();
  if (!webConfig || !webConfig.students) {
    return res.status(404).json(createErrorResponse('Web-Student relationship not found'));
  }
  
  // Check if relationship exists
  const studentIndex = webConfig.students.findIndex(
    (studentId: any) => studentId.toString() === id
  );
  
  if (studentIndex === -1) {
    return res.status(404).json(createErrorResponse('Web-Student relationship not found'));
  }
  
  // Remove student from web configuration
  webConfig.students.splice(studentIndex, 1);
  await webConfig.save();
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Web-Student relationship deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
