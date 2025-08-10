/**
 * Enhanced test endpoint to verify CORS configuration and deployment
 * Should be publicly accessible without authentication issues
 */
export default function handler(req, res) {
  // Set comprehensive CORS headers first
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

  // Test response with comprehensive information
  const testData = {
    success: true,
    message: 'Enhanced API test endpoint - CORS enabled',
    method: req.method,
    timestamp: new Date().toISOString(),
    endpoint: '/api/test',
    cors: {
      status: 'ENABLED',
      policy: 'Allow all origins (*)',
      methods: 'GET, POST, OPTIONS, HEAD',
      credentials: false
    },
    request: {
      origin: req.headers.origin || null,
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...' || null,
      host: req.headers.host || null,
      method: req.method,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown'
    },
    deployment: {
      url: process.env.VERCEL_URL || 'localhost',
      region: process.env.VERCEL_REGION || 'unknown',
      env: process.env.NODE_ENV || 'production',
      vercelEnv: process.env.VERCEL_ENV || 'unknown'
    },
    environment: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      nodeVersion: process.version
    },
    query: req.query || {},
    bodyType: typeof req.body
  };

  try {
    return res.status(200).json(testData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
