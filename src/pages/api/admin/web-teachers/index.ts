import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields, isValidObjectId, toObjectId } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Web, Teacher } from '@/db/models';

/**
 * Web-Teachers relationship management endpoints
 * GET /api/admin/web-teachers - Get all web-teacher relationships (Content Access or higher)
 * POST /api/admin/web-teachers - Create new web-teacher relationship (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getWebTeachers(req, res);
      case 'POST':
        return await createWebTeacher(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Teachers operation failed');
  }
}

/**
 * Get all web-teacher relationships with pagination and filtering
 */
async function getWebTeachers(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, filter } = parseQueryOptions(req.query);
  
  // Build query to get web config with populated teachers
  const webConfig = await Web.findOne()
    .populate({
      path: 'teachers',
      model: 'Teacher',
      populate: {
        path: 'avatar',
        model: 'Media',
        select: 'url alt_text'
      }
    });
  
  if (!webConfig) {
    return res.status(404).json(createErrorResponse('Web configuration not found'));
  }
  
  let teachers = webConfig.teachers || [];
  
  // Apply search filter if provided
  if (filter.search) {
    teachers = teachers.filter((teacher: any) => 
      teacher.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      teacher.surname?.toLowerCase().includes(filter.search.toLowerCase()) ||
      teacher.position?.toLowerCase().includes(filter.search.toLowerCase())
    );
  }
  
  // Apply pagination
  const total = teachers.length;
  const skip = (page - 1) * limit;
  const paginatedTeachers = teachers.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    webTeachers: paginatedTeachers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Web-Teachers relationships retrieved successfully'));
}

/**
 * Create new web-teacher relationship
 */
async function createWebTeacher(req: AuthenticatedRequest, res: NextApiResponse) {
  const relationData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['teacher_id'];
  const missingFields = validateRequiredFields(relationData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate ObjectId
  if (!isValidObjectId(relationData.teacher_id)) {
    return res.status(400).json(createErrorResponse('Invalid teacher_id'));
  }
  
  // Check if teacher exists
  const teacher = await Teacher.findById(toObjectId(relationData.teacher_id));
  if (!teacher) {
    return res.status(404).json(createErrorResponse('Teacher not found'));
  }
  
  // Get or create web configuration
  let webConfig = await Web.findOne();
  if (!webConfig) {
    webConfig = new Web({});
    await webConfig.save();
  }
  
  // Check if relationship already exists
  if (webConfig.teachers && webConfig.teachers.includes(toObjectId(relationData.teacher_id))) {
    return res.status(409).json(createErrorResponse('Web-Teacher relationship already exists'));
  }
  
  // Add teacher to web configuration
  if (!webConfig.teachers) {
    webConfig.teachers = [];
  }
  webConfig.teachers.push(toObjectId(relationData.teacher_id));
  await webConfig.save();
  
  // Populate for response
  await webConfig.populate({
    path: 'teachers',
    model: 'Teacher',
    populate: {
      path: 'avatar',
      model: 'Media',
      select: 'url alt_text'
    }
  });
  
  return res.status(201).json(createSuccessResponse(
    { teacher: teacher.toJSON() },
    'Web-Teacher relationship created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
