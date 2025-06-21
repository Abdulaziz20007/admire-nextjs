import { NextApiRequest, NextApiResponse } from 'next';
import { 
  withDatabase, 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  parseQueryOptions, 
  createPaginatedResponse,
  buildQuery,
  sanitizeInput,
  validateRequiredFields
} from '@/lib/db-utils';
import { Teacher } from '@/db/models';
import { TeacherInput, CEFRLevel } from '@/types/database';

/**
 * Teachers API endpoint
 * GET /api/teachers - Get all teachers with pagination and search
 * POST /api/teachers - Create new teacher
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    return handleApiError(error, res, 'Teachers API error');
  }
}

/**
 * Get teachers with pagination, search, and filtering
 */
async function getTeachers(req: NextApiRequest, res: NextApiResponse) {
  const options = parseQueryOptions(req.query);
  
  // Build search query
  const searchFields = ['name', 'surname', 'about', 'quote'];
  const query = buildQuery(searchFields, options);
  
  // Add CEFR filter if provided
  if (options.filter?.cefr) {
    query.cefr = options.filter.cefr;
  }

  // Execute query with pagination
  const skip = (options.page - 1) * options.limit;
  
  const [teachers, total] = await Promise.all([
    Teacher.find(query)
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit)
      .lean(),
    Teacher.countDocuments(query)
  ]);

  return res.status(200).json(
    createPaginatedResponse(teachers, total, options.page, options.limit, 'Teachers retrieved successfully')
  );
}

/**
 * Create new teacher
 */
async function createTeacher(req: NextApiRequest, res: NextApiResponse) {
  const teacherData: TeacherInput = sanitizeInput(req.body);

  // Validate required fields
  const requiredFields = [
    'name', 'surname', 'about', 'quote', 'image', 
    'overall', 'listening', 'reading', 'writing', 'speaking', 
    'cefr', 'experience', 'students'
  ];
  
  const missingFields = validateRequiredFields(teacherData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }

  // Validate CEFR level
  if (!Object.values(CEFRLevel).includes(teacherData.cefr as CEFRLevel)) {
    return res.status(400).json(
      createErrorResponse('Invalid CEFR level')
    );
  }

  // Validate score ranges (0-100)
  const scores = ['overall', 'listening', 'reading', 'writing', 'speaking'];
  for (const score of scores) {
    const value = teacherData[score as keyof TeacherInput] as number;
    if (value < 0 || value > 100) {
      return res.status(400).json(
        createErrorResponse(`${score} must be between 0 and 100`)
      );
    }
  }

  // Validate experience and students count
  if (teacherData.experience < 0) {
    return res.status(400).json(
      createErrorResponse('Experience cannot be negative')
    );
  }

  if (teacherData.students < 0) {
    return res.status(400).json(
      createErrorResponse('Students count cannot be negative')
    );
  }

  // Create teacher
  const teacher = new Teacher(teacherData);
  await teacher.save();

  return res.status(201).json(
    createSuccessResponse(teacher, 'Teacher created successfully')
  );
}

export default withDatabase(handler);
