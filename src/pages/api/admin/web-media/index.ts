import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields, isValidObjectId, toObjectId } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { WebMedia, Web, Media } from '@/db/models';

/**
 * Web-Media relationship management endpoints
 * GET /api/admin/web-media - Get all web-media relationships (Content Access or higher)
 * POST /api/admin/web-media - Create new web-media relationship (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getWebMedia(req, res);
      case 'POST':
        return await createWebMedia(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Media operation failed');
  }
}

/**
 * Get all web-media relationships with pagination and filtering
 */
async function getWebMedia(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add filters
  if (filter.web_id && isValidObjectId(filter.web_id)) {
    query.web_id = toObjectId(filter.web_id);
  }
  
  if (filter.media_id && isValidObjectId(filter.media_id)) {
    query.media_id = toObjectId(filter.media_id);
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [webMedia, total] = await Promise.all([
    WebMedia.find(query)
      .populate('web_id', 'header_title')
      .populate('media_id', 'title url type')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    WebMedia.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    webMedia,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Web-Media relationships retrieved successfully'));
}

/**
 * Create new web-media relationship
 */
async function createWebMedia(req: AuthenticatedRequest, res: NextApiResponse) {
  const relationData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['web_id', 'media_id'];
  const missingFields = validateRequiredFields(relationData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate ObjectIds
  if (!isValidObjectId(relationData.web_id)) {
    return res.status(400).json(createErrorResponse('Invalid web_id'));
  }
  
  if (!isValidObjectId(relationData.media_id)) {
    return res.status(400).json(createErrorResponse('Invalid media_id'));
  }
  
  // Check if web and media exist
  const [web, media] = await Promise.all([
    Web.findById(toObjectId(relationData.web_id)),
    Media.findById(toObjectId(relationData.media_id))
  ]);
  
  if (!web) {
    return res.status(404).json(createErrorResponse('Web configuration not found'));
  }
  
  if (!media) {
    return res.status(404).json(createErrorResponse('Media not found'));
  }
  
  // Check if relationship already exists
  const existingRelation = await WebMedia.findOne({
    web_id: toObjectId(relationData.web_id),
    media_id: toObjectId(relationData.media_id)
  });
  
  if (existingRelation) {
    return res.status(409).json(createErrorResponse('Web-Media relationship already exists'));
  }
  
  // Create new web-media relationship
  const newWebMedia = new WebMedia({
    web_id: toObjectId(relationData.web_id),
    media_id: toObjectId(relationData.media_id),
    order: relationData.order || 0
  });
  
  await newWebMedia.save();
  
  // Populate for response
  await newWebMedia.populate([
    { path: 'web_id', select: 'header_title' },
    { path: 'media_id', select: 'title url type' }
  ]);
  
  return res.status(201).json(createSuccessResponse(
    newWebMedia.toJSON(),
    'Web-Media relationship created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
