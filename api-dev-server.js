// API 개발 서버 - Vercel 함수들을 로컬에서 테스트
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fortuneHandler from './api/fortune.js';
import manseryeokHandler from './api/manseryeok.js';
import healthHandler from './api/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes
app.all('/api/fortune', (req, res) => {
  console.log(`[${req.method}] /api/fortune`);
  fortuneHandler(req, res);
});

app.all('/api/manseryeok', (req, res) => {
  console.log(`[${req.method}] /api/manseryeok`);
  manseryeokHandler(req, res);
});

app.all('/api/health', (req, res) => {
  console.log(`[${req.method}] /api/health`);
  if (typeof healthHandler === 'function') {
    healthHandler(req, res);
  } else {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
});

// Serve HTML files
app.get('*', (req, res) => {
  const filePath = req.path === '/' ? '/index.html' : req.path;
  res.sendFile(join(__dirname, filePath), (err) => {
    if (err) {
      res.status(404).sendFile(join(__dirname, '404.html'));
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API 개발 서버가 시작되었습니다!`);
  console.log(`📍 주소: http://localhost:${PORT}`);
  console.log(`📡 API 엔드포인트:`);
  console.log(`   - POST http://localhost:${PORT}/api/fortune`);
  console.log(`   - GET  http://localhost:${PORT}/api/manseryeok`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`\n테스트: curl -X POST http://localhost:${PORT}/api/fortune -H "Content-Type: application/json" -d '{"type":"daily","data":{"name":"테스트","birthDate":"1990-01-01","gender":"male"}}'`);
});