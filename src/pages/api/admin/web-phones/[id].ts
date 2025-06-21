import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, isValidObjectId, toObjectId, sanitizeInput } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Phone } from '@/db/models';

/**
 * Individual phone management endpoints
 * GET /api/admin/web-phones/[id] - Get specific phone (Content Access or higher)
 * PUT /api/admin/web-phones/[id] - Update specific phone (Content Access or higher)
 * DELETE /api/admin/web-phones/[id] - Delete specific phone (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Phone ID is required'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createErrorResponse('Invalid phone ID'));
    }
    
    switch (req.method) {
      case 'GET':
        return await getPhone(req, res, id);
      case 'PUT':
        return await updatePhone(req, res, id);
      case 'DELETE':
        return await deletePhone(req, res, id);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Phone operation failed');
  }
}

/**
 * Get specific phone
 */
async function getPhone(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const phone = await Phone.findById(toObjectId(id));
  
  if (!phone) {
    return res.status(404).json(createErrorResponse('Phone not found'));
  }
  
  return res.status(200).json(createSuccessResponse(
    phone.toJSON(),
    'Phone retrieved successfully'
  ));
}

/**
 * Update specific phone
 */
async function updatePhone(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  const updateData = sanitizeInput(req.body);
  
  // Prevent updating certain fields
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  
  // Validate phone number format if being updated
  if (updateData.number) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(updateData.number.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json(createErrorResponse('Invalid phone number format'));
    }
    
    // Check if phone number already exists (excluding current phone)
    const existingPhone = await Phone.findOne({ 
      number: updateData.number,
      _id: { $ne: toObjectId(id) }
    });
    if (existingPhone) {
      return res.status(409).json(createErrorResponse('Phone number already exists'));
    }
  }
  
  // Check if phone exists
  const phone = await Phone.findById(toObjectId(id));
  if (!phone) {
    return res.status(404).json(createErrorResponse('Phone not found'));
  }
  
  // Update phone
  const updatedPhone = await Phone.findByIdAndUpdate(
    toObjectId(id),
    updateData,
    { new: true, runValidators: true }
  );
  
  return res.status(200).json(createSuccessResponse(
    updatedPhone?.toJSON(),
    'Phone updated successfully'
  ));
}

/**
 * Delete specific phone
 */
async function deletePhone(req: AuthenticatedRequest, res: NextApiResponse, id: string) {
  // Check if phone exists
  const phone = await Phone.findById(toObjectId(id));
  if (!phone) {
    return res.status(404).json(createErrorResponse('Phone not found'));
  }
  
  // Delete phone
  await Phone.findByIdAndDelete(toObjectId(id));
  
  return res.status(200).json(createSuccessResponse(
    null,
    'Phone deleted successfully'
  ));
}

export default withDatabase(withPermission(PERMISSIONS.CONTENT_ACCESS)(handler));
