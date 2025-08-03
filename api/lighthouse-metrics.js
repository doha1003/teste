/**
 * 🚀 Lighthouse 메트릭 수집 및 저장 API
 * 실시간 성능 데이터를 JSON 형태로 자동 저장
 */

import { promises as fs } from 'fs';
import path from 'path';

const MAX_REQUESTS_PER_MINUTE = 60;
const requestCounts = new Map();
const METRICS_DIR = path.join(process.cwd(), 'data', 'lighthouse-metrics');

// 메트릭 저장 디렉토리 생성
async function ensureMetricsDir() {
  try {
    await fs.mkdir(METRICS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create metrics directory:', error);
  }
}

// 레이트 리미팅
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter((time) => time > windowStart);
  requestCounts.set(ip, recentRequests);

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  recentRequests.push(now);
  return true;
}

// 메트릭 데이터 검증
function validateMetrics(data) {
  const required = ['timestamp', 'url'];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // 성능 메트릭 검증
  if (data.fcp && (typeof data.fcp !== 'number' || data.fcp < 0)) {
    throw new Error('Invalid FCP value');
  }

  if (data.lcp && (typeof data.lcp !== 'number' || data.lcp < 0)) {
    throw new Error('Invalid LCP value');
  }

  if (data.cls && (typeof data.cls !== 'number' || data.cls < 0)) {
    throw new Error('Invalid CLS value');
  }

  return true;
}

// 성능 점수 계산 (Lighthouse 기준)
function calculatePerformanceScore(metrics) {
  const weights = {
    fcp: 10, // First Contentful Paint
    lcp: 25, // Largest Contentful Paint
    fid: 10, // First Input Delay
    cls: 25, // Cumulative Layout Shift
    ttfb: 10, // Time to First Byte
    si: 10, // Speed Index
    tti: 10, // Time to Interactive
  };

  let totalScore = 0;
  let totalWeight = 0;

  // FCP 점수 (0-2000ms = 100점, 2000-4000ms = 50-100점)
  if (metrics.fcp) {
    const fcpScore =
      metrics.fcp <= 2000
        ? 100
        : metrics.fcp <= 4000
          ? 100 - ((metrics.fcp - 2000) / 2000) * 50
          : 0;
    totalScore += fcpScore * weights.fcp;
    totalWeight += weights.fcp;
  }

  // LCP 점수 (0-2500ms = 100점, 2500-4000ms = 50-100점)
  if (metrics.lcp) {
    const lcpScore =
      metrics.lcp <= 2500
        ? 100
        : metrics.lcp <= 4000
          ? 100 - ((metrics.lcp - 2500) / 1500) * 50
          : 0;
    totalScore += lcpScore * weights.lcp;
    totalWeight += weights.lcp;
  }

  // CLS 점수 (0-0.1 = 100점, 0.1-0.25 = 50-100점)
  if (metrics.cls !== undefined) {
    const clsScore =
      metrics.cls <= 0.1 ? 100 : metrics.cls <= 0.25 ? 100 - ((metrics.cls - 0.1) / 0.15) * 50 : 0;
    totalScore += clsScore * weights.cls;
    totalWeight += weights.cls;
  }

  // FID 점수 (0-100ms = 100점, 100-300ms = 50-100점)
  if (metrics.fid) {
    const fidScore =
      metrics.fid <= 100 ? 100 : metrics.fid <= 300 ? 100 - ((metrics.fid - 100) / 200) * 50 : 0;
    totalScore += fidScore * weights.fid;
    totalWeight += weights.fid;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

// 메트릭 저장
async function saveMetrics(metrics) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = now.toISOString();

  // 성능 점수 계산
  const performanceScore = calculatePerformanceScore(metrics);

  const enhancedMetrics = {
    ...metrics,
    savedAt: timestamp,
    performanceScore,
    korean: {
      date: now.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
      time: now.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' }),
      score:
        performanceScore >= 90
          ? '우수'
          : performanceScore >= 70
            ? '양호'
            : performanceScore >= 50
              ? '보통'
              : '개선필요',
    },
  };

  // 일별 파일에 저장
  const dailyFile = path.join(METRICS_DIR, `${dateStr}.json`);

  try {
    let dailyData = [];
    try {
      const existing = await fs.readFile(dailyFile, 'utf8');
      dailyData = JSON.parse(existing);
    } catch (error) {
      // 파일이 없으면 빈 배열로 시작
    }

    dailyData.push(enhancedMetrics);

    // 최대 1000개 항목만 유지
    if (dailyData.length > 1000) {
      dailyData = dailyData.slice(-1000);
    }

    await fs.writeFile(dailyFile, JSON.stringify(dailyData, null, 2));

    // 최신 메트릭도 별도 저장
    const latestFile = path.join(METRICS_DIR, 'latest.json');
    await fs.writeFile(latestFile, JSON.stringify(enhancedMetrics, null, 2));

    return enhancedMetrics;
  } catch (error) {
    console.error('Failed to save metrics:', error);
    throw error;
  }
}

// 메트릭 조회
async function getMetrics(date, limit = 100) {
  try {
    const dateStr = date || new Date().toISOString().split('T')[0];
    const dailyFile = path.join(METRICS_DIR, `${dateStr}.json`);

    const data = await fs.readFile(dailyFile, 'utf8');
    const metrics = JSON.parse(data);

    return metrics.slice(-limit);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// 주간/월간 집계 데이터 생성
async function generateAggregatedData(period = 'week') {
  const now = new Date();
  const days = period === 'week' ? 7 : 30;
  const aggregated = {
    period,
    startDate: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    totalSamples: 0,
    averageScores: {},
    trends: {},
    summary: {},
  };

  let allMetrics = [];

  // 지정된 기간의 데이터 수집
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    try {
      const dayMetrics = await getMetrics(dateStr, 1000);
      allMetrics = allMetrics.concat(dayMetrics);
    } catch (error) {
      // 데이터가 없는 날은 무시
    }
  }

  if (allMetrics.length === 0) {
    return aggregated;
  }

  aggregated.totalSamples = allMetrics.length;

  // 평균 계산
  const totals = {
    performanceScore: 0,
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
    ttfb: 0,
  };

  const counts = { ...totals };

  allMetrics.forEach((metric) => {
    if (metric.performanceScore) {
      totals.performanceScore += metric.performanceScore;
      counts.performanceScore++;
    }
    if (metric.fcp) {
      totals.fcp += metric.fcp;
      counts.fcp++;
    }
    if (metric.lcp) {
      totals.lcp += metric.lcp;
      counts.lcp++;
    }
    if (metric.cls !== undefined) {
      totals.cls += metric.cls;
      counts.cls++;
    }
    if (metric.fid) {
      totals.fid += metric.fid;
      counts.fid++;
    }
    if (metric.ttfb) {
      totals.ttfb += metric.ttfb;
      counts.ttfb++;
    }
  });

  // 평균값 계산
  Object.keys(totals).forEach((key) => {
    if (counts[key] > 0) {
      aggregated.averageScores[key] = Math.round(totals[key] / counts[key]);
    }
  });

  // 요약 정보
  aggregated.summary = {
    korean: {
      period: period === 'week' ? '주간' : '월간',
      averageScore: aggregated.averageScores.performanceScore || 0,
      status: (aggregated.averageScores.performanceScore || 0) >= 85 ? '목표달성' : '개선필요',
      samples: `${aggregated.totalSamples}개 샘플`,
    },
  };

  return aggregated;
}

export default async function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', 'https://doha.kr');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 레이트 리미팅
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      error: '요청 한도 초과',
      korean: '분당 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
    });
  }

  await ensureMetricsDir();

  try {
    if (req.method === 'POST') {
      const { type, data } = req.body;

      if (type !== 'lighthouse_metrics' || !data) {
        return res.status(400).json({
          error: '잘못된 요청',
          korean: 'lighthouse_metrics 타입과 데이터가 필요합니다.',
        });
      }

      // 데이터 검증
      validateMetrics(data);

      // 메트릭 저장
      const savedMetrics = await saveMetrics(data);

      return res.status(200).json({
        success: true,
        message: 'Lighthouse 메트릭이 저장되었습니다',
        data: savedMetrics,
        korean: {
          message: '성능 메트릭이 성공적으로 저장되었습니다',
          score: savedMetrics.korean.score,
          timestamp: savedMetrics.korean.time,
        },
      });
    }

    if (req.method === 'GET') {
      const { date, limit, period, aggregate } = req.query;

      if (aggregate) {
        // 집계 데이터 반환
        const aggregatedData = await generateAggregatedData(period);

        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1시간 캐시
        return res.status(200).json({
          success: true,
          data: aggregatedData,
          korean: {
            message: `${aggregatedData.summary.korean.period} 성능 집계 데이터`,
            summary: aggregatedData.summary.korean,
          },
        });
      } else {
        // 일별 메트릭 반환
        const metrics = await getMetrics(date, parseInt(limit) || 100);

        res.setHeader('Cache-Control', 'public, max-age=300'); // 5분 캐시
        return res.status(200).json({
          success: true,
          count: metrics.length,
          data: metrics,
          korean: {
            message: `${date || '오늘'} 성능 메트릭 데이터`,
            count: `${metrics.length}개 항목`,
          },
        });
      }
    }

    return res.status(405).json({
      error: '허용되지 않는 메서드',
      korean: 'GET 또는 POST 요청만 지원됩니다',
    });
  } catch (error) {
    console.error('Lighthouse metrics API error:', error);

    return res.status(500).json({
      error: '서버 오류',
      message: error.message,
      korean: {
        message: '메트릭 처리 중 오류가 발생했습니다',
        details: '잠시 후 다시 시도해주세요',
      },
    });
  }
}

// 일일 정리 작업 (크론잡용)
export async function cleanupOldMetrics() {
  try {
    const files = await fs.readdir(METRICS_DIR);
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90일 전

    for (const file of files) {
      if (file.endsWith('.json') && file !== 'latest.json') {
        const fileDate = new Date(file.replace('.json', ''));

        if (fileDate < cutoffDate) {
          await fs.unlink(path.join(METRICS_DIR, file));
          console.log(`Deleted old metrics file: ${file}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Cleanup failed:', error);
    return false;
  }
}
