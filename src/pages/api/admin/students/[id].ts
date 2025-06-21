import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Student } from '@/db/models';

/**
 * Individual student management endpoints
 * GET /api/admin/students/[id] - Get specific student (Content Access or higher)
 * PUT /api/admin/students/[id] - Update specific student (Content Access or higher)
 * DELETE /api/admin/students/[id] - Delete specific student (Content Access or higher)
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
      case 'GET':
        return await getStudent(req, res, id);
      case 'PUT':
        return await updateStudent(req, res, id);
      case 'DELETE':
        return await deleteStudent(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Student operation failed');
  }
}

/**
 * Get specific student
 */
async function getStudent(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const student = await Student.findById(toObjectId(id))
    .populate('avatar', 'url alt_text');
  
  if (!student) {
    return res.status(404).json(createErrorResponse('Student not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    student.toJSON(),
    'Student retrieved successfully'
  ));
}

/**
 * Update specific student
 */
async function updateStudent(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Validate CEFR level if being updated
  if (updateData.level) {
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validLevels.includes(updateData.level)) {
      return res.status(400).json(createErrorResponse('Invalid CEFR level'));
    }
  }
  
  // Check if student exists
  const student = await Student.findById(toObjectId(id));
  if (!student) {
    return res.status(404).json(createErrorResponse('Student not found'));
  }
  
  // Update student
  const updatedStudent = await Student.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  ).populate('avatar', 'url alt_text');
  
  return res.status(200).json(createSuccessResponse(
    updatedStudent?.toJSON(),
    'Student updated successfully'
  ));
}

/**
 * Delete specific student
 */
async function deleteStudent(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if student exists
  const student = await Student.findById(toObjectId(id));
  if (!student) {
    return res.status(404).json(createErrorResponse('Student not found'));
  }
  
  // Delete student
  await Student.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Student deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
