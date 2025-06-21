import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, handleApiError } from '@/lib/db-utils';
import { isConnected, getConnectionState } from '@/lib/mongodb';

/**
 * Health check endpoint for database connection
 * GET /api/health
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const connectionState = getConnectionState();
    const connected = isConnected();

    const healthData = {
      status: connected ? 'healthy' : 'unhealthy',
      database: {
        connected,
        state: connectionState,
        timestamp: new Date().toISOString()
      },
      environment: process.env.NODE_ENV || 'development'
    };

    return res.status(connected ? 200 : 503).json(
      createSuccessResponse(healthData, connected ? 'Database is healthy' : 'Database connection issues')
    );
  } catch (error) {
    return handleApiError(error, res, 'Health check failed');
  }
}

export default withDatabase(handler);
