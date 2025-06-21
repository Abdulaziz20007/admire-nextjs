import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Social } from '@/db/models';

/**
 * Individual social media management endpoints
 * GET /api/admin/socials/[id] - Get specific social media link (Content Access or higher)
 * PUT /api/admin/socials/[id] - Update specific social media link (Content Access or higher)
 * DELETE /api/admin/socials/[id] - Delete specific social media link (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Social media ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid social media ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getSocial(req, res, id);
      case 'PUT':
        return await updateSocial(req, res, id);
      case 'DELETE':
        return await deleteSocial(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Social media operation failed');
  }
}

/**
 * Get specific social media link
 */
async function getSocial(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const social = await Social.findById(toObjectId(id))
    .populate('icon', 'name url');
  
  if (!social) {
    return res.status(404).json(createErrorResponse('Social media link not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    social.toJSON(),
    'Social media link retrieved successfully'
  ));
}

/**
 * Update specific social media link
 */
async function updateSocial(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Validate URL format if being updated
  if (updateData.url) {
    try {
      new URL(updateData.url);
    } catch (error) {
      return res.status(400).json(createErrorResponse('Invalid URL format'));
    }
  }
  
  // Check if social media link exists
  const social = await Social.findById(toObjectId(id));
  if (!social) {
    return res.status(404).json(createErrorResponse('Social media link not found'));
  }
  
  // Update social media link
  const updatedSocial = await Social.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  ).populate('icon', 'name url');
  
  return res.status(200).json(createSuccessResponse(
    updatedSocial?.toJSON(),
    'Social media link updated successfully'
  ));
}

/**
 * Delete specific social media link
 */
async function deleteSocial(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if social media link exists
  const social = await Social.findById(toObjectId(id));
  if (!social) {
    return res.status(404).json(createErrorResponse('Social media link not found'));
  }
  
  // Delete social media link
  await Social.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Social media link deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
