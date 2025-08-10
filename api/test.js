// 가장 간단한 테스트 API
export default function handler(req, res) {
  res.status(200).json({
    message: 'API is working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
    }
  });
}