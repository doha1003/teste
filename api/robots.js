/**
 * 🤖 robots.txt 동적 생성 API
 * SEO 최적화를 위한 로봇 크롤링 규칙
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction ? 'https://doha.kr' : 'http://localhost:3000';

  const robotsTxt = `# doha.kr 로봇 크롤링 규칙
# 한국어 심리테스트 및 운세 서비스

User-agent: *
${isProduction ? 'Allow: /' : 'Disallow: /'}

# 주요 페이지들
Allow: /
Allow: /fortune/
Allow: /tests/
Allow: /tools/

# API 엔드포인트는 크롤링 제외
Disallow: /api/

# 관리자 페이지 제외
Disallow: /admin/
Disallow: /_next/
Disallow: /node_modules/

# 중복 컨텐츠 방지
Disallow: /test/
Disallow: /fortune-telling/

# 검색엔진별 특별 규칙
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: NaverBot
Allow: /
Crawl-delay: 1

# 사이트맵 위치
Sitemap: ${baseUrl}/sitemap.xml

# 추가 정보
# 사이트: doha.kr
# 언어: 한국어
# 카테고리: 심리테스트, 운세, 실용도구
# 업데이트: ${new Date().toISOString().split('T')[0]}
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // 24시간 캐시
  
  return res.status(200).send(robotsTxt);
}