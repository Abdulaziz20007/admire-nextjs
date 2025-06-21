import { NextApiRequest, NextApiResponse } from 'next';
import { 
  withDatabase, 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  sanitizeInput
} from '@/lib/db-utils';
import { Web } from '@/db/models';
import { WebInput } from '@/types/database';

/**
 * Web content API endpoint
 * GET /api/content/web - Get web configuration
 * PUT /api/content/web - Update web configuration
 * POST /api/content/web - Create initial web configuration
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getWebContent(res);
      case 'PUT':
        return await updateWebContent(req, res);
      case 'POST':
        return await createWebContent(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web content API error');
  }
}

/**
 * Get web configuration
 */
async function getWebContent(res: NextApiResponse) {
  const webContent = await Web.findOne()
    .populate('mainPhone')
    .populate('phones')
    .populate('teachers')
    .populate('students')
    .populate({
      path: 'media',
      populate: {
        path: 'media',
        model: 'Media'
      }
    })
    .populate({
      path: 'socials',
      populate: {
        path: 'icon',
        model: 'Icon'
      }
    })
    .lean();

  if (!webContent) {
    return res.status(404).json(createErrorResponse('Web configuration not found'));
  }

  return res.status(200).json(
    createSuccessResponse(webContent, 'Web content retrieved successfully')
  );
}

/**
 * Update web configuration
 */
async function updateWebContent(req: NextApiRequest, res: NextApiResponse) {
  const updateData: Partial<WebInput> = sanitizeInput(req.body);

  // Validate statistics if provided
  const stats = ['totalStudents', 'bestStudents', 'totalTeachers'];
  for (const stat of stats) {
    const value = updateData[stat as keyof WebInput] as number;
    if (value !== undefined && value < 0) {
      return res.status(400).json(
        createErrorResponse(`${stat} cannot be negative`)
      );
    }
  }

  // Validate email format if provided
  if (updateData.email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(updateData.email)) {
      return res.status(400).json(
        createErrorResponse('Invalid email format')
      );
    }
  }

  const webContent = await Web.findOneAndUpdate(
    {},
    updateData,
    { new: true, runValidators: true, upsert: false }
  )
    .populate('mainPhone')
    .populate('phones')
    .lean();

  if (!webContent) {
    return res.status(404).json(createErrorResponse('Web configuration not found'));
  }

  return res.status(200).json(
    createSuccessResponse(webContent, 'Web content updated successfully')
  );
}

/**
 * Create initial web configuration
 */
async function createWebContent(req: NextApiRequest, res: NextApiResponse) {
  // Check if web configuration already exists
  const existingWeb = await Web.findOne();
  if (existingWeb) {
    return res.status(409).json(
      createErrorResponse('Web configuration already exists. Use PUT to update.')
    );
  }

  const webData: WebInput = sanitizeInput(req.body);

  // Validate required fields
  const requiredFields = [
    'headerImg', 'headerH1Uz', 'headerH1En',
    'aboutP1Uz', 'aboutP1En', 'aboutP2Uz', 'aboutP2En',
    'totalStudents', 'bestStudents', 'totalTeachers',
    'galleryPUz', 'galleryPEn', 'teachersPUz', 'teachersPEn',
    'studentsPUz', 'studentsPEn', 'addressUz', 'addressEn',
    'orientationUz', 'orientationEn', 'workTime', 'workTimeSunday',
    'extendedAddressUz', 'extendedAddressEn', 'email',
    'footerPUz', 'footerPEn', 'mainPhone'
  ];

  const missingFields: string[] = [];
  requiredFields.forEach(field => {
    if (!webData[field as keyof WebInput]) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }

  // Validate statistics
  const stats = ['totalStudents', 'bestStudents', 'totalTeachers'];
  for (const stat of stats) {
    const value = webData[stat as keyof WebInput] as number;
    if (value < 0) {
      return res.status(400).json(
        createErrorResponse(`${stat} cannot be negative`)
      );
    }
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(webData.email)) {
    return res.status(400).json(
      createErrorResponse('Invalid email format')
    );
  }

  const webContent = new Web(webData);
  await webContent.save();

  return res.status(201).json(
    createSuccessResponse(webContent, 'Web content created successfully')
  );
}

export default withDatabase(handler);
