/**
 * CSP Violation Report Handler
 * 
 * This endpoint receives Content Security Policy violation reports
 * from browsers when CSP rules are violated.
 */

export default async function handler(req, res) {
  // CORS headers for CSP reporting
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse CSP report
    const report = req.body;
    
    // Log CSP violation (in production, you might want to send this to a logging service)
    console.log('CSP Violation Report:', JSON.stringify(report, null, 2));

    // Extract key information from the report
    const violation = report['csp-report'] || {};
    const {
      'document-uri': documentUri,
      'referrer': referrer,
      'violated-directive': violatedDirective,
      'effective-directive': effectiveDirective,
      'original-policy': originalPolicy,
      'disposition': disposition,
      'blocked-uri': blockedUri,
      'line-number': lineNumber,
      'column-number': columnNumber,
      'source-file': sourceFile,
      'status-code': statusCode,
      'script-sample': scriptSample
    } = violation;

    // Log formatted violation info
    console.log('CSP Violation Details:', {
      documentUri,
      violatedDirective,
      blockedUri,
      sourceFile,
      lineNumber,
      disposition,
      timestamp: new Date().toISOString()
    });

    // In production, you might want to:
    // 1. Send to a logging service (e.g., Sentry, LogRocket)
    // 2. Store in a database for analysis
    // 3. Send alerts for critical violations
    // 4. Filter out known/expected violations

    // Respond with success
    return res.status(204).end();
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return res.status(400).json({ error: 'Invalid CSP report' });
  }
}