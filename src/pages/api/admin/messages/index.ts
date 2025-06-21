import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, parseQueryOptions } from '@/lib/db-utils';
import { withPermission, AuthenticatedRequest, PERMISSIONS } from '@/lib/auth-middleware';
import { Message } from '@/db/models';

/**
 * Messages management endpoints
 * GET /api/admin/messages - Get all messages (Message Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getMessages(req, res);
      default:
        return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return handleApiError(error, res, 'Messages operation failed');
  }
}

/**
 * Get all messages with pagination and filtering
 */
async function getMessages(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit, sort, search, filter } = parseQueryOptions(req.query);
  
  // Build query
  const query: any = {};
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add filters
  if (filter.is_checked !== undefined) {
    query.is_checked = filter.is_checked === 'true';
  }
  
  if (filter.phone) {
    query.phone = { $regex: filter.phone, $options: 'i' };
  }
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json(createSuccessResponse({
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, 'Messages retrieved successfully'));
}

export default withDatabase(withPermission(PERMISSIONS.MESSAGE_ACCESS)(handler));
