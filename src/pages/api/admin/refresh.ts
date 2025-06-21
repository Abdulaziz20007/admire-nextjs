import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/db-utils';
import { Admin } from '@/db/models';
import { AuthTokenPayload, AuthResponse } from '@/types/database';

/**
 * Admin token refresh endpoint
 * GET /api/admin/refresh - Refresh access token using refresh token
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(createErrorResponse('Method not allowed'));
  }

  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json(createErrorResponse('No refresh token provided'));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtSecret) as AuthTokenPayload;
    
    // Find admin to ensure they still exist and are not blocked
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json(createErrorResponse('Admin not found'));
    }

    if (admin.priority === '0') {
      return res.status(403).json(createErrorResponse('Account is blocked'));
    }

    // Generate new access token
    const tokenPayload: AuthTokenPayload = {
      adminId: admin._id.toString(),
      username: admin.username,
      priority: admin.priority
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_ACCESS_TIME || '1d'
    });

    // Generate new refresh token
    const newRefreshToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_REFRESH_TIME || '7d'
    });

    // Set new refresh token cookie
    const cookieTime = parseInt(process.env.COOKIE_TIME || '604800000'); // 7 days
    res.setHeader('Set-Cookie', [
      `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${cookieTime / 1000}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    const response: AuthResponse = {
      success: true,
      data: {
        admin: admin.toJSON(),
        accessToken,
        refreshToken: newRefreshToken
      },
      message: 'Token refreshed successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(createErrorResponse('Invalid refresh token'));
    }
    return handleApiError(error, res, 'Token refresh failed');
  }
}

export default withDatabase(handler);
