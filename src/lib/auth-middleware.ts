import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createErrorResponse } from './db-utils';
import { AuthTokenPayload } from '@/types/database';

// Extend NextApiRequest to include admin data
export interface AuthenticatedRequest extends NextApiRequest {
  admin: AuthTokenPayload;
}

/**
 * Authentication middleware for admin routes
 * Verifies JWT token and adds admin data to request
 */
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(createErrorResponse('No token provided'));
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json(createErrorResponse('Server configuration error'));
      }

      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
      
      // Check if admin is blocked
      if (decoded.priority === '0') {
        return res.status(403).json(createErrorResponse('Account is blocked'));
      }

      // Add admin data to request
      (req as AuthenticatedRequest).admin = decoded;

      // Call the handler with authenticated request
      return await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(createErrorResponse('Invalid token'));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json(createErrorResponse('Token expired'));
      }
      
      console.error('Auth middleware error:', error);
      return res.status(500).json(createErrorResponse('Authentication failed'));
    }
  };
}

/**
 * Permission middleware for role-based access control
 * Checks if admin has required priority level
 */
export function withPermission(requiredPriority: string) {
  return function(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const adminPriority = parseInt(req.admin.priority);
      const required = parseInt(requiredPriority);

      if (adminPriority < required) {
        return res.status(403).json(createErrorResponse('Insufficient permissions'));
      }

      return await handler(req, res);
    });
  };
}

/**
 * Permission levels:
 * 0 = Blocked (no access)
 * 1 = Messages Only (can access messages, toggle is_checked)
 * 2 = Content Manager (inherits 1 + can modify content + delete messages)
 * 3 = Super Admin (inherits 1,2 + can manage admins)
 */
export const PERMISSIONS = {
  BLOCKED: '0',
  MESSAGE_ACCESS: '1',
  CONTENT_ACCESS: '2',
  FULL_ACCESS: '3'
} as const;

/**
 * Check if admin has specific permission for an action
 */
export function hasPermission(adminPriority: string, requiredPriority: string): boolean {
  const admin = parseInt(adminPriority);
  const required = parseInt(requiredPriority);
  return admin >= required;
}

/**
 * Get permissions for admin priority level
 */
export function getPermissions(priority: string) {
  const level = parseInt(priority);
  
  return {
    canAccessMessages: level >= 1,
    canToggleMessageStatus: level >= 1,
    canDeleteMessages: level >= 2,
    canModifyContent: level >= 2,
    canManageAdmins: level >= 3,
    canAccessSettings: level >= 3
  };
}
