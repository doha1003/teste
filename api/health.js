// Health check endpoint for monitoring
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return health status
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'doha.kr',
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
}