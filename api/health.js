/**
 * Health check endpoint for monitoring and CORS testing
 * Supports comprehensive health status reporting
 */
export default function handler(req, res) {
  // Enhanced CORS headers - allow all origins and methods for health check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Support both GET and HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET', 'HEAD', 'OPTIONS'],
      received: req.method
    });
  }

  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'doha.kr API',
      version: '3.1.0',
      environment: process.env.NODE_ENV || 'production',
      region: process.env.VERCEL_REGION || 'unknown',
      deployment: {
        url: process.env.VERCEL_URL || 'localhost',
        git_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        git_commit_ref: process.env.VERCEL_GIT_COMMIT_REF || 'unknown'
      },
      cors: {
        origin_allowed: '*',
        methods_allowed: ['GET', 'POST', 'OPTIONS', 'HEAD'],
        headers_allowed: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent']
      },
      request_info: {
        method: req.method,
        headers: {
          origin: req.headers.origin || null,
          'user-agent': req.headers['user-agent'] || null,
          host: req.headers.host || null
        },
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown'
      },
      uptime_check: true,
      api_endpoints: [
        '/api/health',
        '/api/logs', 
        '/api/fortune',
        '/api/manseryeok',
        '/api/csp-report',
        '/api/analytics'
      ]
    };

    // For HEAD requests, only send headers
    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }

    // Send JSON response for GET requests
    return res.status(200).json(healthData);

  } catch (error) {
    console.error('[Health Check Error]', error);
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      service: 'doha.kr API'
    };

    return res.status(500).json(errorResponse);
  }
}
