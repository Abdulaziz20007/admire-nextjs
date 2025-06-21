import { NextApiRequest, NextApiResponse } from 'next';
import { 
  withDatabase, 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  isValidObjectId,
  toObjectId,
  sanitizeInput
} from '@/lib/db-utils';
import { Teacher } from '@/db/models';
import { TeacherInput, CEFRLevel } from '@/types/database';

/**
 * Individual Teacher API endpoint
 * GET /api/teachers/[id] - Get teacher by ID
 * PUT /api/teachers/[id] - Update teacher by ID
 * DELETE /api/teachers/[id] - Delete teacher by ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Validate ObjectId
  if (!id || typeof id !== 'string' || !isValidObjectId(id)) {
    return res.status(400).json(createErrorResponse('Invalid teacher ID'));
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getTeacher(id, res);
      case 'PUT':
        return await updateTeacher(id, req, res);
      case 'DELETE':
        return await deleteTeacher(id, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Teacher API error');
  }
}

/**
 * Get teacher by ID
 */
async function getTeacher(id: string, res: NextApiResponse) {
  const teacher = await Teacher.findById(toObjectId(id)).lean();
  
  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }

  return res.status(200).json(
    createSuccessResponse(teacher, 'Teacher retrieved successfully')
  );
}

/**
 * Update teacher by ID
 */
async function updateTeacher(id: string, req: NextApiRequest, res: NextApiResponse) {
  const updateData: Partial<TeacherInput> = sanitizeInput(req.body);

  // Validate CEFR level if provided
  if (updateData.cefr && !Object.values(CEFRLevel).includes(updateData.cefr as CEFRLevel)) {
    return res.status(400).json(createErrorResponse('Invalid CEFR level'));
  }

  // Validate score ranges if provided
  const scores = ['overall', 'listening', 'reading', 'writing', 'speaking'];
  for (const score of scores) {
    const value = updateData[score as keyof TeacherInput] as number;
    if (value !== undefined && (value < 0 || value > 100)) {
      return res.status(400).json(
        createErrorResponse(`${score} must be between 0 and 100`)
      );
    }
  }

  // Validate experience and students count if provided
  if (updateData.experience !== undefined && updateData.experience < 0) {
    return res.status(400).json(
      createErrorResponse('Experience cannot be negative')
    );
  }

  if (updateData.students !== undefined && updateData.students < 0) {
    return res.status(400).json(
      createErrorResponse('Students count cannot be negative')
    );
  }

  const teacher = await Teacher.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  ).lean();

  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }

  return res.status(200).json(
    createSuccessResponse(teacher, 'Teacher updated successfully')
  );
}

/**
 * Delete teacher by ID
 */
async function deleteTeacher(id: string, res: NextApiResponse) {
  const teacher = await Teacher.findByIdAndDelete(toObjectId(id)).lean();

  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }

  return res.status(200).json(
    createSuccessResponse({ id }, 'Teacher deleted successfully')
  );
}

export default withDatabase(handler);
