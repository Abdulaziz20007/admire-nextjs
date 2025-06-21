import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Web, Social } from '@/db/models';

/**
 * Individual web-social relationship management endpoints
 * DELETE /api/admin/web-socials/[id] - Delete specific web-social relationship (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Social ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid social ID'));
    }
    
    switch (req.method) {
      case 'DELETE':
        return await deleteWebSocial(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Web-Social operation failed');
  }
}

/**
 * Delete specific web-social relationship
 */
async function deleteWebSocial(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if social exists
  const social = await Social.findById(toObjectId(id));
  if (!social) {
    return res.status(404).json(createErrorResponse('Social not found'));
  }
  
  // Get web configuration
  const webConfig = await Web.findOne();
  if (!webConfig || !webConfig.socials) {
    return res.status(404).json(createErrorResponse('Web-Social relationship not found'));
  }
  
  // Check if relationship exists
  const socialIndex = webConfig.socials.findIndex(
    (socialId: any) => socialId.toString() === id
  );
  
  if (socialIndex === -1) {
    return res.status(404).json(createErrorResponse('Web-Social relationship not found'));
  }
  
  // Remove social from web configuration
  webConfig.socials.splice(socialIndex, 1);
  await webConfig.save();
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Web-Social relationship deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
