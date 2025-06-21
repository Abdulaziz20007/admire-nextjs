import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/db-utils';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

/**
 * Admin logout endpoint
 * GET /api/admin/logout - Logout admin
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(createErrorResponse('Method not allowed'));
  }

  try {
    // Clear the refresh token cookie
    res.setHeader('Set-Cookie', [
      'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
    ]);

    return res.status(200).json(createSuccessResponse(null, 'Logout successful'));
  } catch (error) {
    return handleApiError(error, res, 'Logout failed');
  }
}

export default withDatabase(withAuth(handler));
