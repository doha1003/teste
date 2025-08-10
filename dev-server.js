/**
 * 로컬 개발용 API 서버
 * Vercel 함수들을 로컬에서 테스트하기 위한 간단한 Express 서버
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://doha.kr', 'https://www.doha.kr'],
  credentials: true
}));

// JSON 파싱 미들웨어
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(__dirname));

// API 함수들을 동적으로 로드하고 실행하는 헬퍼
async function loadAndExecuteAPI(apiPath, req, res) {
  try {
    const { default: handler } = await import(`./api/${apiPath}.js`);
    
    // Vercel 함수 시그니처에 맞게 변환
    const mockVercelRequest = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: JSON.stringify(req.body),
      query: req.query,
      json: async () => req.body
    };
    
    const mockVercelResponse = {
      status: (code) => {
        res.status(code);
        return mockVercelResponse;
      },
      json: (data) => {
        res.json(data);
        return mockVercelResponse;
      },
      send: (data) => {
        res.send(data);
        return mockVercelResponse;
      },
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return mockVercelResponse;
      }
    };
    
    await handler(mockVercelRequest, mockVercelResponse);
    
  } catch (error) {
    console.error(`Error in ${apiPath}:`, error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    });
  }
}

// API 라우트 설정
app.all('/api/fortune', (req, res) => loadAndExecuteAPI('fortune', req, res));
app.all('/api/manseryeok', (req, res) => loadAndExecuteAPI('manseryeok', req, res));
app.all('/api/csp-report', (req, res) => loadAndExecuteAPI('csp-report', req, res));
app.all('/api/health', (req, res) => loadAndExecuteAPI('health', req, res));

// 404 핸들러
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).send('Page not found');
  }
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 개발 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('📡 API 엔드포인트:');
  console.log('  - GET/POST /api/health');
  console.log('  - POST /api/fortune');
  console.log('  - POST /api/manseryeok');
  console.log('  - POST /api/csp-report');
});