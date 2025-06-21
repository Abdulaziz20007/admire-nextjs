import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Teacher } from '@/db/models';

/**
 * Teachers management endpoints
 * GET /api/admin/teachers - Get all teachers (Content Access or higher)
 * POST /api/admin/teachers - Create new teacher (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getTeachers(req, res);
      case 'POST':
        return await createTeacher(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Teachers operation failed');
  }
}

/**
 * Get all teachers with pagination and filtering
 */
async function getTeachers(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { surname: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.is_active !== undefined) {
    query.is_active = filter.is_active === 'true';
  }
  
  if (filter.is_featured !== undefined) {
    query.is_featured = filter.is_featured === 'true';
  }
  
  if (filter.experience_years) {
    query.experience_years = { $gte: parseInt(filter.experience_years) };
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [teachers, total] = await Promise.all([
    Teacher.find(query)
      .populate('avatar', 'url alt_text')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Teacher.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    teachers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Teachers retrieved successfully'));
}

/**
 * Create new teacher
 */
async function createTeacher(req: AuthenticatedRequest, res: NextApiResponse) {
  const teacherData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['name', 'surname', 'position'];
  const missingFields = validateRequiredFields(teacherData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Create new teacher
  const newTeacher = new Teacher({
    name: teacherData.name,
    surname: teacherData.surname,
    position: teacherData.position,
    bio: teacherData.bio || '',
    experience_years: teacherData.experience_years || 0,
    specializations: teacherData.specializations || [],
    avatar: teacherData.avatar || undefined,
    is_active: teacherData.is_active !== undefined ? teacherData.is_active : true,
    is_featured: teacherData.is_featured !== undefined ? teacherData.is_featured : false,
    order: teacherData.order || 0
  });
  
  await newTeacher.save();
  
  // Populate avatar for response
  await newTeacher.populate('avatar', 'url alt_text');
  
  return res.status(201).json(createSuccessResponse(
    newTeacher.toJSON(),
    'Teacher created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
