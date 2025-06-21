import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError, sanitizeInput, validateRequiredFields } from '@/lib/db-utils';
import { Admin } from '@/db/models';
import { LoginCredentials, AuthResponse, AuthTokenPayload } from '@/types/database';

/**
 * Admin authentication endpoint
 * POST /api/admin/auth - Login
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json(createErrorResponse('Method not allowed'));
  }

  try {
    const { username, password }: LoginCredentials = sanitizeInput(req.body);

    // Validate required fields
    const missingFields = validateRequiredFields({ username, password }, ['username', 'password']);
    if (missingFields.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
      );
    }

    // Find admin by username
    const admin = await Admin.findOne({ username: username.toLowerCase() }).select('+password');
    if (!admin) {
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Check if admin is blocked
    if (admin.priority === '0') {
      return res.status(403).json(createErrorResponse('Account is blocked'));
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Generate JWT tokens
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const tokenPayload: AuthTokenPayload = {
      adminId: admin._id.toString(),
      username: admin.username,
      priority: admin.priority
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_ACCESS_TIME || '1d'
    });

    const refreshToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_REFRESH_TIME || '7d'
    });

    // Set HTTP-only cookie for refresh token
    const cookieTime = parseInt(process.env.COOKIE_TIME || '604800000'); // 7 days
    res.setHeader('Set-Cookie', [
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${cookieTime / 1000}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    // Remove password from response
    const adminResponse = admin.toJSON();

    const response: AuthResponse = {
      success: true,
      data: {
        admin: adminResponse,
        accessToken,
        refreshToken
      },
      message: 'Login successful'
    };

    return res.status(200).json(response);
  } catch (error) {
    return handleApiError(error, res, 'Authentication failed');
  }
}

export default withDatabase(handler);
