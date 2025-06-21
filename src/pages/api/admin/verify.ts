import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/db-utils';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { Admin } from '@/db/models';

/**
 * Admin token verification endpoint
 * GET /api/admin/verify - Verify access token and return admin data
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(createErrorResponse('Method not allowed'));
  }

  try {
    // Get admin data from token (added by auth middleware)
    const adminId = req.admin.adminId;
    
    // Fetch fresh admin data from database
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json(createErrorResponse('Admin not found'));
    }

    if (admin.priority === '0') {
      return res.status(403).json(createErrorResponse('Account is blocked'));
    }

    return res.status(200).json(createSuccessResponse({
      admin: admin.toJSON()
    }, 'Token verified successfully'));
  } catch (error) {
    return handleApiError(error, res, 'Token verification failed');
  }
}

export default withDatabase(withAuth(handler));
