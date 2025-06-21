import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Icon } from '@/db/models';

/**
 * Individual icon management endpoints
 * GET /api/admin/icons/[id] - Get specific icon (Content Access or higher)
 * PUT /api/admin/icons/[id] - Update specific icon (Content Access or higher)
 * DELETE /api/admin/icons/[id] - Delete specific icon (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Icon ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid icon ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getIcon(req, res, id);
      case 'PUT':
        return await updateIcon(req, res, id);
      case 'DELETE':
        return await deleteIcon(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Icon operation failed');
  }
}

/**
 * Get specific icon
 */
async function getIcon(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const icon = await Icon.findById(toObjectId(id));
  
  if (!icon) {
    return res.status(404).json(createErrorResponse('Icon not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    icon.toJSON(),
    'Icon retrieved successfully'
  ));
}

/**
 * Update specific icon
 */
async function updateIcon(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
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
  
  // Check if icon name already exists (excluding current icon)
  if (updateData.name) {
    const existingIcon = await Icon.findOne({ 
      name: updateData.name,
      _id: { $ne: toObjectId(id) }
    });
    if (existingIcon) {
      return res.status(409).json(createErrorResponse('Icon name already exists'));
    }
  }
  
  // Check if icon exists
  const icon = await Icon.findById(toObjectId(id));
  if (!icon) {
    return res.status(404).json(createErrorResponse('Icon not found'));
  }
  
  // Update icon
  const updatedIcon = await Icon.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  );
  
  return res.status(200).json(createSuccessResponse(
    updatedIcon?.toJSON(),
    'Icon updated successfully'
  ));
}

/**
 * Delete specific icon
 */
async function deleteIcon(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if icon exists
  const icon = await Icon.findById(toObjectId(id));
  if (!icon) {
    return res.status(404).json(createErrorResponse('Icon not found'));
  }
  
  // Delete icon
  await Icon.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Icon deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
