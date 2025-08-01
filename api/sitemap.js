/**
 * 🗺️ 사이트맵 동적 생성 API
 * SEO 최적화를 위한 XML 사이트맵
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://doha.kr' 
    : 'http://localhost:3000';

  const currentDate = new Date().toISOString().split('T')[0];

  // 정적 페이지들
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'weekly' },
    { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' }
  ];

  // 운세 서비스 페이지들
  const fortunePages = [
    { url: '/fortune', priority: '0.9', changefreq: 'daily' },
    { url: '/fortune/daily', priority: '0.9', changefreq: 'daily' },
    { url: '/fortune/saju', priority: '0.8', changefreq: 'weekly' },
    { url: '/fortune/tarot', priority: '0.8', changefreq: 'weekly' },
    { url: '/fortune/zodiac', priority: '0.8', changefreq: 'weekly' },
    { url: '/fortune/zodiac-animal', priority: '0.8', changefreq: 'weekly' }
  ];

  // 심리테스트 페이지들
  const testPages = [
    { url: '/tests', priority: '0.9', changefreq: 'weekly' },
    { url: '/tests/mbti', priority: '0.8', changefreq: 'monthly' },
    { url: '/tests/mbti/test', priority: '0.7', changefreq: 'monthly' },
    { url: '/tests/love-dna', priority: '0.8', changefreq: 'monthly' },
    { url: '/tests/love-dna/test', priority: '0.7', changefreq: 'monthly' },
    { url: '/tests/teto-egen', priority: '0.8', changefreq: 'monthly' },
    { url: '/tests/teto-egen/test', priority: '0.7', changefreq: 'monthly' }
  ];

  // 도구 페이지들
  const toolPages = [
    { url: '/tools', priority: '0.8', changefreq: 'weekly' },
    { url: '/tools/bmi-calculator.html', priority: '0.7', changefreq: 'monthly' },
    { url: '/tools/salary-calculator.html', priority: '0.7', changefreq: 'monthly' },
    { url: '/tools/text-counter.html', priority: '0.7', changefreq: 'monthly' }
  ];

  // 모든 페이지 합치기
  const allPages = [
    ...staticPages,
    ...fortunePages,
    ...testPages,
    ...toolPages
  ];

  // XML 사이트맵 생성
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- doha.kr 사이트맵 -->
  <!-- 한국어 심리테스트 및 운세 서비스 -->
  <!-- 생성일: ${currentDate} -->
  
  ${allPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="${baseUrl}${page.url}" />
  </url>`).join('')}
  
  <!-- 이미지 사이트맵 정보 -->
  <url>
    <loc>${baseUrl}/images/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // 24시간 캐시
  
  return res.status(200).send(sitemap);
}