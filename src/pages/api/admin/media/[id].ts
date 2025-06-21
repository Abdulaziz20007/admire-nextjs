import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Media } from '@/db/models';

/**
 * Individual media management endpoints
 * GET /api/admin/media/[id] - Get specific media (Content Access or higher)
 * PUT /api/admin/media/[id] - Update specific media (Content Access or higher)
 * DELETE /api/admin/media/[id] - Delete specific media (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Media ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid media ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getMedia(req, res, id);
      case 'PUT':
        return await updateMedia(req, res, id);
      case 'DELETE':
        return await deleteMedia(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Media operation failed');
  }
}

/**
 * Get specific media
 */
async function getMedia(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const media = await Media.findById(toObjectId(id));
  
  if (!media) {
    return res.status(404).json(createErrorResponse('Media not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    media.toJSON(),
    'Media retrieved successfully'
  ));
}

/**
 * Update specific media
 */
async function updateMedia(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Validate media type if being updated
  if (updateData.type) {
    const validTypes = ['image', 'video'];
    if (!validTypes.includes(updateData.type)) {
      return res.status(400).json(createErrorResponse('Invalid media type. Must be image or video'));
    }
  }
  
  // Validate media size if being updated
  if (updateData.size) {
    const validSizes = ['1x1', '1x2'];
    if (!validSizes.includes(updateData.size)) {
      return res.status(400).json(createErrorResponse('Invalid media size. Must be 1x1 or 1x2'));
    }
  }
  
  // Check if media exists
  const media = await Media.findById(toObjectId(id));
  if (!media) {
    return res.status(404).json(createErrorResponse('Media not found'));
  }
  
  // Update media
  const updatedMedia = await Media.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  );
  
  return res.status(200).json(createSuccessResponse(
    updatedMedia?.toJSON(),
    'Media updated successfully'
  ));
}

/**
 * Delete specific media
 */
async function deleteMedia(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if media exists
  const media = await Media.findById(toObjectId(id));
  if (!media) {
    return res.status(404).json(createErrorResponse('Media not found'));
  }
  
  // Delete media
  await Media.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Media deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
