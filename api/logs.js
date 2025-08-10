/**
 * Enhanced logging endpoint for client-side error reporting
 * Supports comprehensive log collection and CORS
 */
export default function handler(req, res) {
  // Enhanced CORS headers - allow all origins for logging (critical for error tracking)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Support POST for logging and GET for status
  if (req.method === 'GET') {
    return res.status(200).json({
      service: 'doha.kr Logging API',
      status: 'operational',
      supported_methods: ['POST', 'OPTIONS', 'GET'],
      log_levels: ['error', 'warn', 'info', 'debug'],
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST', 'GET', 'OPTIONS'],
      received: req.method
    });
  }

  try {
    const logData = req.body || {};
    const {
      level = 'info',
      message,
      timestamp,
      userAgent,
      url,
      error,
      stack,
      component,
      userId,
      sessionId,
      additionalData
    } = logData;

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Log message is required'
      });
    }

    // Create enhanced log entry
    const enhancedLog = {
      timestamp: timestamp || new Date().toISOString(),
      level: level.toLowerCase(),
      message,
      source: 'client',
      service: 'doha.kr',
      request: {
        userAgent: userAgent || req.headers['user-agent'],
        url: url || req.headers.referer,
        origin: req.headers.origin,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        method: req.method
      },
      error: error ? {
        message: error.message || error,
        stack: stack || error.stack,
        name: error.name
      } : null,
      component: component || 'unknown',
      session: {
        userId: userId || null,
        sessionId: sessionId || null
      },
      additionalData: additionalData || null,
      server: {
        region: process.env.VERCEL_REGION || 'unknown',
        deployment: process.env.VERCEL_URL || 'localhost'
      }
    };

    // Log based on severity
    switch (level.toLowerCase()) {
      case 'error':
        console.error('[CLIENT ERROR]', enhancedLog);
        break;
      case 'warn':
        console.warn('[CLIENT WARN]', enhancedLog);
        break;
      case 'debug':
        console.debug('[CLIENT DEBUG]', enhancedLog);
        break;
      default:
        console.log('[CLIENT LOG]', enhancedLog);
    }

    // Store critical errors for monitoring (in production, send to monitoring service)
    if (level.toLowerCase() === 'error') {
      // Here you would typically send to Sentry, DataDog, or similar
      console.error('🚨 CRITICAL CLIENT ERROR:', {
        message,
        url,
        userAgent,
        timestamp: enhancedLog.timestamp,
        error: enhancedLog.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Log received and processed',
      logId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level: level.toLowerCase(),
      timestamp: enhancedLog.timestamp
    });

  } catch (processingError) {
    console.error('[LOGS API PROCESSING ERROR]', {
      error: processingError.message,
      stack: processingError.stack,
      timestamp: new Date().toISOString(),
      requestBody: req.body
    });

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process log entry',
      details: processingError.message,
      timestamp: new Date().toISOString()
    });
  }
}
