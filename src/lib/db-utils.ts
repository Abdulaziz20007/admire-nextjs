import { NextApiRequest, NextApiResponse } from 'next';
import { Types } from 'mongoose';
import connectDB from './mongodb';
import { ApiResponse, PaginatedResponse, QueryOptions } from '@/types/database';

/**
 * Database connection wrapper for API routes
 * Ensures database connection before executing handler
 */
export function withDatabase(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await connectDB();
      return await handler(req, res);
    } catch (error) {
      console.error('Database connection error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed'
      } as ApiResponse);
    }
  };
}

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Convert string to ObjectId with validation
 */
export function toObjectId(id: string): Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new Types.ObjectId(id);
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any, res: NextApiResponse, defaultMessage = 'Internal server error') {
  console.error('API Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map((err: any) => err.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors
    } as ApiResponse);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`
    } as ApiResponse);
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    } as ApiResponse);
  }

  // Custom application errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message || defaultMessage
    } as ApiResponse);
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: defaultMessage
  } as ApiResponse);
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Create error response
 */
export function createErrorResponse(error: string, statusCode?: number): ApiResponse & { statusCode?: number } {
  return {
    success: false,
    error,
    statusCode
  };
}

/**
 * Parse query parameters for pagination and filtering
 */
export function parseQueryOptions(query: any): QueryOptions {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 10, 100); // Max 100 items per page
  const sort = query.sort || '-createdAt';
  const search = query.search || '';
  
  // Parse filter parameters
  const filter: Record<string, any> = {};
  Object.keys(query).forEach(key => {
    if (!['page', 'limit', 'sort', 'search'].includes(key)) {
      filter[key] = query[key];
    }
  });

  return { page, limit, sort, search, filter };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): PaginatedResponse<T> {
  const pages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
}

/**
 * Build MongoDB query from search and filter options
 */
export function buildQuery(searchFields: string[], options: QueryOptions) {
  const query: any = {};

  // Add search functionality
  if (options.search && searchFields.length > 0) {
    query.$or = searchFields.map(field => ({
      [field]: { $regex: options.search, $options: 'i' }
    }));
  }

  // Add filters
  if (options.filter) {
    Object.keys(options.filter).forEach(key => {
      const value = options.filter![key];
      
      // Handle array filters (e.g., status=active,inactive)
      if (typeof value === 'string' && value.includes(',')) {
        query[key] = { $in: value.split(',') };
      } else {
        query[key] = value;
      }
    });
  }

  return query;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    Object.keys(input).forEach(key => {
      sanitized[key] = sanitizeInput(input[key]);
    });
    return sanitized;
  }
  
  return input;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data: any, requiredFields: string[]): string[] {
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(field);
    }
  });
  
  return missingFields;
}

/**
 * Check if user has required permission level
 */
export function hasPermission(userPriority: string, requiredPriority: string): boolean {
  const priorities = ['0', '1', '2', '3']; // 0=blocked, 1=basic, 2=content, 3=admin
  const userLevel = priorities.indexOf(userPriority);
  const requiredLevel = priorities.indexOf(requiredPriority);
  
  return userLevel >= requiredLevel;
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
