import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput } from '@/lib/db-utils';
import { withAuth, AuthenticatedRequest, hasPermission, PERMISSIONS } from '@/lib/auth-middleware';
import { Message } from '@/db/models';

/**
 * Individual message management endpoints
 * GET /api/admin/messages/[id] - Get specific message (Message Access or higher)
 * PUT /api/admin/messages/[id] - Update specific message (Message Access for is_checked, Content Access for others)
 * DELETE /api/admin/messages/[id] - Delete specific message (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Message ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid message ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getMessage(req, res, id);
      case 'PUT':
        return await updateMessage(req, res, id);
      case 'DELETE':
        return await deleteMessage(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Message operation failed');
  }
}

/**
 * Get specific message
 */
async function getMessage(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check permission (Message Access or higher)
  if (!hasPermission(req.admin.priority, PERMISSIONS.MESSAGE_ACCESS)) {
    return res.status(403).json(createErrorResponse('Insufficient permissions'));
  }
  
  const message = await Message.findById(toObjectId(id));
  
  if (!message) {
    return res.status(404).json(createErrorResponse('Message not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    message.toJSON(),
    'Message retrieved successfully'
  ));
}

/**
 * Update specific message
 */
async function updateMessage(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Check if only updating is_checked (Message Access) or other fields (Content Access)
  const isOnlyCheckingStatus = Object.keys(updateData).length === 1 && 'is_checked' in updateData;
  
  if (isOnlyCheckingStatus) {
    // Allow Message Access or higher to toggle is_checked
    if (!hasPermission(req.admin.priority, PERMISSIONS.MESSAGE_ACCESS)) {
      return res.status(403).json(createErrorResponse('Insufficient permissions'));
    }
  } else {
    // Require Content Access or higher for other updates
    if (!hasPermission(req.admin.priority, PERMISSIONS.CONTENT_ACCESS)) {
      return res.status(403).json(createErrorResponse('Insufficient permissions'));
    }
  }
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Check if message exists
  const message = await Message.findById(toObjectId(id));
  if (!message) {
    return res.status(404).json(createErrorResponse('Message not found'));
  }
  
  // Update message
  const updatedMessage = await Message.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  );
  
  return res.status(200).json(createSuccessResponse(
    updatedMessage?.toJSON(),
    'Message updated successfully'
  ));
}

/**
 * Delete specific message
 */
async function deleteMessage(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check permission (Content Access or higher)
  if (!hasPermission(req.admin.priority, PERMISSIONS.CONTENT_ACCESS)) {
    return res.status(403).json(createErrorResponse('Insufficient permissions'));
  }
  
  // Check if message exists
  const message = await Message.findById(toObjectId(id));
  if (!message) {
    return res.status(404).json(createErrorResponse('Message not found'));
  }
  
  // Delete message
  await Message.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Message deleted successfully'
  ));
}

export default withDatabase(withAuth(handler));
