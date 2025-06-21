import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Social } from '@/db/models';

/**
 * Social media management endpoints
 * GET /api/admin/socials - Get all social media links (Content Access or higher)
 * POST /api/admin/socials - Create new social media link (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getSocials(req, res);
      case 'POST':
        return await createSocial(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Social media operation failed');
  }
}

/**
 * Get all social media links with pagination and filtering
 */
async function getSocials(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { url: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.is_active !== undefined) {
    query.is_active = filter.is_active === 'true';
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [socials, total] = await Promise.all([
    Social.find(query)
      .populate('icon', 'name url')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Social.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    socials,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Social media links retrieved successfully'));
}

/**
 * Create new social media link
 */
async function createSocial(req: AuthenticatedRequest, res: NextApiResponse) {
  const socialData = sanitizeInput(req.body);
  
  // Validate required fields
  const requiredFields = ['name', 'url'];
  const missingFields = validateRequiredFields(socialData, requiredFields);
  if (missingFields.length > 0) {
    return res.status(400).json(
      createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
    );
  }
  
  // Validate URL format
  try {
    new URL(socialData.url);
  } catch (error) {
    return res.status(400).json(createErrorResponse('Invalid URL format'));
  }
  
  // Create new social media link
  const newSocial = new Social({
    name: socialData.name,
    url: socialData.url,
    icon: socialData.icon || undefined,
    is_active: socialData.is_active !== undefined ? socialData.is_active : true,
    order: socialData.order || 0
  });
  
  await newSocial.save();
  
  // Populate icon for response
  await newSocial.populate('icon', 'name url');
  
  return res.status(201).json(createSuccessResponse(
    newSocial.toJSON(),
    'Social media link created successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
