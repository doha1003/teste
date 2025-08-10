// Logging endpoint for client-side error reporting
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { level, message, timestamp, userAgent, url, error } = req.body;

    // In production, you would send this to a logging service
    // For now, just acknowledge receipt
    console.log('[Client Log]', {
      level,
      message,
      timestamp,
      userAgent,
      url,
      error
    });

    return res.status(200).json({
      success: true,
      message: 'Log received'
    });
  } catch (error) {
    console.error('[Logs API Error]', error);
    return res.status(500).json({
      error: 'Failed to process log',
      message: error.message
    });
  }
}