import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields, isValidObjectId, toObjectId } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Web, Student } from '@/db/models';

/**
 * Web-Students relationship management endpoints
 * GET /api/admin/web-students - Get all web-student relationships (Content Access or higher)
 * POST /api/admin/web-students - Create new web-student relationship (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getWebStudents(req, res);
      case 'POST':
        return await createWebStudent(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Students operation failed');
  }
}

/**
 * Get all web-student relationships with pagination and filtering
 */
async function getWebStudents(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, filter } = parseQueryOptions(req.query);
  
  // Build query to get web config with populated students
  const webConfig = await Web.findOne()
    .populate({
      path: 'students',
      model: 'Student',
      populate: {
        path: 'avatar',
        model: 'Media',
        select: 'url alt_text'
      }
    });
  
  if (!webConfig) {
    return res.status(404).json(createErrorResponse('Web configuration not found'));
  }
  
  let students = webConfig.students || [];
  
  // Apply search filter if provided
  if (filter.search) {
    students = students.filter((student: any) => 
      student.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      student.surname?.toLowerCase().includes(filter.search.toLowerCase()) ||
      student.course?.toLowerCase().includes(filter.search.toLowerCase())
    );
  }
  
  // Apply pagination
  const total = students.length;
  const skip = (page - 1) * limit;
  const paginatedStudents = students.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    webStudents: paginatedStudents,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Web-Students relationships retrieved successfully'));
}

/**
 * Create new web-student relationship
 */
async function createWebStudent(req: AuthenticatedRequest, res: NextApiResponse) {
  const relationData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['student_id'];
  const missingFields = validateRequiredFields(relationData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate ObjectId
  if (!isValidObjectId(relationData.student_id)) {
    return res.status(400).json(createErrorResponse('Invalid student_id'));
  }
  
  // Check if student exists
  const student = await Student.findById(toObjectId(relationData.student_id));
  if (!student) {
    return res.status(404).json(createErrorResponse('Student not found'));
  }
  
  // Get or create web configuration
  let webConfig = await Web.findOne();
  if (!webConfig) {
    webConfig = new Web({});
    await webConfig.save();
  }
  
  // Check if relationship already exists
  if (webConfig.students && webConfig.students.includes(toObjectId(relationData.student_id))) {
    return res.status(409).json(createErrorResponse('Web-Student relationship already exists'));
  }
  
  // Add student to web configuration
  if (!webConfig.students) {
    webConfig.students = [];
  }
  webConfig.students.push(toObjectId(relationData.student_id));
  await webConfig.save();
  
  // Populate for response
  await webConfig.populate({
    path: 'students',
    model: 'Student',
    populate: {
      path: 'avatar',
      model: 'Media',
      select: 'url alt_text'
    }
  });
  
  return res.status(201).json(createSuccessResponse(
    { student: student.toJSON() },
    'Web-Student relationship created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
