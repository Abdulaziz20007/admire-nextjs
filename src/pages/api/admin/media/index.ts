import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Media } from '@/db/models';

/**
 * Media management endpoints
 * GET /api/admin/media - Get all media (Content Access or higher)
 * POST /api/admin/media - Create new media (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getMedia(req, res);
      case 'POST':
        return await createMedia(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Media operation failed');
  }
}

/**
 * Get all media with pagination and filtering
 */
async function getMedia(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { alt_text: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.is_active !== undefined) {
    query.is_active = filter.is_active === 'true';
  }
  
  if (filter.type) {
    query.type = filter.type;
  }
  
  if (filter.size) {
    query.size = filter.size;
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [media, total] = await Promise.all([
    Media.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Media.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    media,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Media retrieved successfully'));
}

/**
 * Create new media
 */
async function createMedia(req: AuthenticatedRequest, res: NextApiResponse) {
  const mediaData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['title', 'url', 'type'];
  const missingFields = validateRequiredFields(mediaData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate media type
  const validTypes = ['image', 'video'];
  if (!validTypes.includes(mediaData.type)) {
    return res.status(400).json(createErrorResponse('Invalid media type. Must be image or video'));
  }
  
  // Validate media size
  const validSizes = ['1x1', '1x2'];
  if (mediaData.size && !validSizes.includes(mediaData.size)) {
    return res.status(400).json(createErrorResponse('Invalid media size. Must be 1x1 or 1x2'));
  }
  
  // Create new media
  const newMedia = new Media({
    title: mediaData.title,
    description: mediaData.description || '',
    url: mediaData.url,
    type: mediaData.type,
    size: mediaData.size || '1x1',
    alt_text: mediaData.alt_text || mediaData.title,
    is_active: mediaData.is_active !== undefined ? mediaData.is_active : true,
    order: mediaData.order || 0
  });
  
  await newMedia.save();
  
  return res.status(201).json(createSuccessResponse(
    newMedia.toJSON(),
    'Media created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
