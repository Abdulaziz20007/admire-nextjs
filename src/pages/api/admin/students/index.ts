import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Student } from '@/db/models';

/**
 * Students management endpoints
 * GET /api/admin/students - Get all students (Content Access or higher)
 * POST /api/admin/students - Create new student (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getStudents(req, res);
      case 'POST':
        return await createStudent(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Students operation failed');
  }
}

/**
 * Get all students with pagination and filtering
 */
async function getStudents(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { surname: { $regex: search, $options: 'i' } },
      { course: { $regex: search, $options: 'i' } },
      { testimonial: { $regex: search, $options: 'i' } },
      { achievement: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.is_active !== undefined) {
    query.is_active = filter.is_active === 'true';
  }
  
  if (filter.level) {
    query.level = filter.level;
  }
  
  if (filter.course) {
    query.course = { $regex: filter.course, $options: 'i' };
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('avatar', 'url alt_text')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Students retrieved successfully'));
}

/**
 * Create new student
 */
async function createStudent(req: AuthenticatedRequest, res: NextApiResponse) {
  const studentData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['name', 'surname', 'course', 'level'];
  const missingFields = validateRequiredFields(studentData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate CEFR level
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (studentData.level && !validLevels.includes(studentData.level)) {
    return res.status(400).json(createErrorResponse('Invalid CEFR level'));
  }
  
  // Create new student
  const newStudent = new Student({
    name: studentData.name,
    surname: studentData.surname,
    course: studentData.course,
    level: studentData.level,
    testimonial: studentData.testimonial || '',
    achievement: studentData.achievement || '',
    avatar: studentData.avatar || undefined,
    is_active: studentData.is_active !== undefined ? studentData.is_active : true,
    order: studentData.order || 0
  });
  
  await newStudent.save();
  
  // Populate avatar for response
  await newStudent.populate('avatar', 'url alt_text');
  
  return res.status(201).json(createSuccessResponse(
    newStudent.toJSON(),
    'Student created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
