// 간단한 Fortune API - 디버깅용
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 환경 변수 확인
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  
  try {
    // POST 요청만 처리
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }

    // 요청 본문 파싱
    const body = req.body || {};
    
    // 디버깅 정보 반환
    const debugInfo = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        hasApiKey,
        apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
        nodeVersion: process.version,
        platform: process.platform
      },
      request: {
        method: req.method,
        headers: req.headers,
        body: body
      },
      testResponse: {
        type: body.type || 'daily',
        message: '테스트 운세입니다. API 키가 설정되어 있습니다.',
        fortune: {
          overall: '오늘은 좋은 일이 생길 것입니다.',
          love: '애정운이 상승하고 있습니다.',
          money: '금전운이 좋습니다.',
          health: '건강에 유의하세요.'
        }
      }
    };

    // 실제 Gemini API 테스트
    if (hasApiKey) {
      try {
        // 동적 import 사용
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // 간단한 테스트 요청
        const result = await model.generateContent('오늘의 운세를 한 줄로 알려주세요.');
        const response = await result.response;
        const text = response.text();
        
        debugInfo.geminiTest = {
          success: true,
          response: text.substring(0, 100)
        };
      } catch (geminiError) {
        debugInfo.geminiTest = {
          success: false,
          error: geminiError.message,
          stack: geminiError.stack
        };
      }
    }

    return res.status(200).json(debugInfo);
    
  } catch (error) {
    console.error('Fortune API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}