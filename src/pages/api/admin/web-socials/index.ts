import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields, isValidObjectId, toObjectId } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Web, Social } from '@/db/models';

/**
 * Web-Socials relationship management endpoints
 * GET /api/admin/web-socials - Get all web-social relationships (Content Access or higher)
 * POST /api/admin/web-socials - Create new web-social relationship (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getWebSocials(req, res);
      case 'POST':
        return await createWebSocial(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Socials operation failed');
  }
}

/**
 * Get all web-social relationships with pagination and filtering
 */
async function getWebSocials(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, filter } = parseQueryOptions(req.query);
  
  // Build query to get web config with populated socials
  const webConfig = await Web.findOne()
    .populate({
      path: 'socials',
      model: 'Social',
      populate: {
        path: 'icon',
        model: 'Icon',
        select: 'name url'
      }
    });
  
  if (!webConfig) {
    return res.status(404).json(createErrorResponse('Web configuration not found'));
  }
  
  let socials = webConfig.socials || [];
  
  // Apply search filter if provided
  if (filter.search) {
    socials = socials.filter((social: any) => 
      social.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      social.url?.toLowerCase().includes(filter.search.toLowerCase())
    );
  }
  
  // Apply pagination
  const total = socials.length;
  const skip = (page - 1) * limit;
  const paginatedSocials = socials.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    webSocials: paginatedSocials,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Web-Socials relationships retrieved successfully'));
}

/**
 * Create new web-social relationship
 */
async function createWebSocial(req: AuthenticatedRequest, res: NextApiResponse) {
  const relationData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['social_id'];
  const missingFields = validateRequiredFields(relationData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate ObjectId
  if (!isValidObjectId(relationData.social_id)) {
    return res.status(400).json(createErrorResponse('Invalid social_id'));
  }
  
  // Check if social exists
  const social = await Social.findById(toObjectId(relationData.social_id));
  if (!social) {
    return res.status(404).json(createErrorResponse('Social not found'));
  }
  
  // Get or create web configuration
  let webConfig = await Web.findOne();
  if (!webConfig) {
    webConfig = new Web({});
    await webConfig.save();
  }
  
  // Check if relationship already exists
  if (webConfig.socials && webConfig.socials.includes(toObjectId(relationData.social_id))) {
    return res.status(409).json(createErrorResponse('Web-Social relationship already exists'));
  }
  
  // Add social to web configuration
  if (!webConfig.socials) {
    webConfig.socials = [];
  }
  webConfig.socials.push(toObjectId(relationData.social_id));
  await webConfig.save();
  
  // Populate for response
  await webConfig.populate({
    path: 'socials',
    model: 'Social',
    populate: {
      path: 'icon',
      model: 'Icon',
      select: 'name url'
    }
  });
  
  return res.status(201).json(createSuccessResponse(
    { social: social.toJSON() },
    'Web-Social relationship created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
