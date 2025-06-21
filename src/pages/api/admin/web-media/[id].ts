import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { WebMedia } from '@/db/models';

/**
 * Individual web-media relationship management endpoints
 * GET /api/admin/web-media/[id] - Get specific web-media relationship (Content Access or higher)
 * PUT /api/admin/web-media/[id] - Update specific web-media relationship (Content Access or higher)
 * DELETE /api/admin/web-media/[id] - Delete specific web-media relationship (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Web-Media relationship ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid web-media relationship ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getWebMedia(req, res, id);
      case 'PUT':
        return await updateWebMedia(req, res, id);
      case 'DELETE':
        return await deleteWebMedia(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Media operation failed');
  }
}

/**
 * Get specific web-media relationship
 */
async function getWebMedia(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const webMedia = await WebMedia.findById(toObjectId(id))
    .populate('web_id', 'header_title')
    .populate('media_id', 'title url type');
  
  if (!webMedia) {
    return res.status(404).json(createErrorResponse('Web-Media relationship not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    webMedia.toJSON(),
    'Web-Media relationship retrieved successfully'
  ));
}

/**
 * Update specific web-media relationship
 */
async function updateWebMedia(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  delete updateData.web_id; // Don't allow changing the web_id
  delete updateData.media_id; // Don't allow changing the media_id
  
  // Check if web-media relationship exists
  const webMedia = await WebMedia.findById(toObjectId(id));
  if (!webMedia) {
    return res.status(404).json(createErrorResponse('Web-Media relationship not found'));
  }
  
  // Update web-media relationship (only order can be updated)
  const updatedWebMedia = await WebMedia.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'web_id', select: 'header_title' },
    { path: 'media_id', select: 'title url type' }
  ]);
  
  return res.status(200).json(createSuccessResponse(
    updatedWebMedia?.toJSON(),
    'Web-Media relationship updated successfully'
  ));
}

/**
 * Delete specific web-media relationship
 */
async function deleteWebMedia(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if web-media relationship exists
  const webMedia = await WebMedia.findById(toObjectId(id));
  if (!webMedia) {
    return res.status(404).json(createErrorResponse('Web-Media relationship not found'));
  }
  
  // Delete web-media relationship
  await WebMedia.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Web-Media relationship deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
