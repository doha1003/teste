/**
 * PWA 스크린샷 및 shortcut 아이콘 생성 스크립트
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 스크린샷 생성 함수
async function generateScreenshots() {
  const outputDir = path.join(__dirname, '../images/screenshots');

  try {
    // 스크린샷 디렉토리 생성
    await fs.mkdir(outputDir, { recursive: true });

    // 모바일 홈 스크린샷 (390x844)
    const mobileHomeSvg = `
      <svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f9fafb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="390" height="844" fill="url(#bg)"/>
        
        <!-- Header -->
        <rect x="0" y="0" width="390" height="88" fill="#6366f1"/>
        <text x="195" y="60" font-family="Arial, sans-serif" font-size="20" font-weight="bold" 
              text-anchor="middle" fill="white">doha.kr</text>
        
        <!-- Service Cards -->
        <rect x="20" y="120" width="350" height="120" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <text x="195" y="165" font-family="Arial, sans-serif" font-size="18" font-weight="600" 
              text-anchor="middle" fill="#111827">MBTI 성격검사</text>
        <text x="195" y="190" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="#6b7280">16가지 성격유형 테스트</text>
        
        <rect x="20" y="260" width="350" height="120" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <text x="195" y="305" font-family="Arial, sans-serif" font-size="18" font-weight="600" 
              text-anchor="middle" fill="#111827">AI 사주운세</text>
        <text x="195" y="330" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="#6b7280">개인맞춤 운세보기</text>
        
        <rect x="20" y="400" width="350" height="120" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <text x="195" y="445" font-family="Arial, sans-serif" font-size="18" font-weight="600" 
              text-anchor="middle" fill="#111827">실용도구</text>
        <text x="195" y="470" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="#6b7280">BMI, 연봉계산기</text>
      </svg>
    `;

    await sharp(Buffer.from(mobileHomeSvg)).png().toFile(path.join(outputDir, 'mobile-home.png'));
    console.log('✓ mobile-home.png 생성 완료');

    // 모바일 테스트 스크린샷
    const mobileTestsSvg = `
      <svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
        <rect width="390" height="844" fill="#f9fafb"/>
        
        <!-- Header -->
        <rect x="0" y="0" width="390" height="88" fill="#6366f1"/>
        <text x="195" y="60" font-family="Arial, sans-serif" font-size="20" font-weight="bold" 
              text-anchor="middle" fill="white">심리테스트</text>
        
        <!-- Test Cards -->
        <rect x="20" y="120" width="350" height="150" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <circle cx="70" cy="170" r="20" fill="#6366f1"/>
        <text x="110" y="165" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#111827">MBTI 테스트</text>
        <text x="110" y="185" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">성격유형 분석</text>
        
        <rect x="20" y="290" width="350" height="150" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <circle cx="70" cy="340" r="20" fill="#10b981"/>
        <text x="110" y="335" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#111827">테토-에겐</text>
        <text x="110" y="355" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">행동양식 테스트</text>
        
        <rect x="20" y="460" width="350" height="150" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <circle cx="70" cy="510" r="20" fill="#f59e0b"/>
        <text x="110" y="505" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#111827">러브 DNA</text>
        <text x="110" y="525" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">연애 궁합 테스트</text>
      </svg>
    `;

    await sharp(Buffer.from(mobileTestsSvg)).png().toFile(path.join(outputDir, 'mobile-tests.png'));
    console.log('✓ mobile-tests.png 생성 완료');

    // 모바일 도구 스크린샷
    const mobileToolsSvg = `
      <svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
        <rect width="390" height="844" fill="#f9fafb"/>
        
        <!-- Header -->
        <rect x="0" y="0" width="390" height="88" fill="#6366f1"/>
        <text x="195" y="60" font-family="Arial, sans-serif" font-size="20" font-weight="bold" 
              text-anchor="middle" fill="white">실용도구</text>
        
        <!-- Tool Cards -->
        <rect x="20" y="120" width="350" height="120" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <text x="195" y="165" font-family="Arial, sans-serif" font-size="18" font-weight="600" 
              text-anchor="middle" fill="#111827">BMI 계산기</text>
        <text x="195" y="190" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="#6b7280">체질량지수 계산</text>
        
        <rect x="20" y="260" width="350" height="120" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <text x="195" y="305" font-family="Arial, sans-serif" font-size="18" font-weight="600" 
              text-anchor="middle" fill="#111827">텍스트 카운터</text>
        <text x="195" y="330" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="#6b7280">글자수, 단어수 계산</text>
        
        <rect x="20" y="400" width="350" height="120" rx="12" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <text x="195" y="445" font-family="Arial, sans-serif" font-size="18" font-weight="600" 
              text-anchor="middle" fill="#111827">연봉 계산기</text>
        <text x="195" y="470" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="#6b7280">실수령액 계산</text>
      </svg>
    `;

    await sharp(Buffer.from(mobileToolsSvg)).png().toFile(path.join(outputDir, 'mobile-tools.png'));
    console.log('✓ mobile-tools.png 생성 완료');

    // 데스크톱 홈 스크린샷 (1280x800)
    const desktopHomeSvg = `
      <svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
        <rect width="1280" height="800" fill="#f9fafb"/>
        
        <!-- Header -->
        <rect x="0" y="0" width="1280" height="80" fill="#6366f1"/>
        <text x="640" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="white">doha.kr - 심리테스트, 실용도구, AI 운세</text>
        
        <!-- Service Grid -->
        <rect x="100" y="150" width="320" height="200" rx="16" fill="white" stroke="#e5e7eb" stroke-width="2"/>
        <text x="260" y="220" font-family="Arial, sans-serif" font-size="24" font-weight="600" 
              text-anchor="middle" fill="#111827">MBTI 테스트</text>
        <text x="260" y="250" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" fill="#6b7280">16가지 성격유형 분석</text>
        
        <rect x="480" y="150" width="320" height="200" rx="16" fill="white" stroke="#e5e7eb" stroke-width="2"/>
        <text x="640" y="220" font-family="Arial, sans-serif" font-size="24" font-weight="600" 
              text-anchor="middle" fill="#111827">AI 사주운세</text>
        <text x="640" y="250" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" fill="#6b7280">개인맞춤 운세보기</text>
        
        <rect x="860" y="150" width="320" height="200" rx="16" fill="white" stroke="#e5e7eb" stroke-width="2"/>
        <text x="1020" y="220" font-family="Arial, sans-serif" font-size="24" font-weight="600" 
              text-anchor="middle" fill="#111827">실용도구</text>
        <text x="1020" y="250" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" fill="#6b7280">계산기, 카운터</text>
      </svg>
    `;

    await sharp(Buffer.from(desktopHomeSvg)).png().toFile(path.join(outputDir, 'desktop-home.png'));
    console.log('✓ desktop-home.png 생성 완료');

    // 데스크톱 MBTI 스크린샷
    const desktopMbtiSvg = `
      <svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
        <rect width="1280" height="800" fill="#f9fafb"/>
        
        <!-- Header -->
        <rect x="0" y="0" width="1280" height="80" fill="#6366f1"/>
        <text x="640" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="white">MBTI 성격검사</text>
        
        <!-- Question Card -->
        <rect x="240" y="150" width="800" height="400" rx="16" fill="white" stroke="#e5e7eb" stroke-width="2"/>
        <text x="640" y="220" font-family="Arial, sans-serif" font-size="20" font-weight="600" 
              text-anchor="middle" fill="#111827">질문 1/60</text>
        
        <text x="640" y="280" font-family="Arial, sans-serif" font-size="18" 
              text-anchor="middle" fill="#374151">새로운 사람들과 만날 때 어떤 느낌인가요?</text>
        
        <!-- Answer Options -->
        <rect x="280" y="340" width="720" height="60" rx="8" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1"/>
        <text x="640" y="375" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" fill="#374151">A. 에너지가 충전되고 즐겁다</text>
        
        <rect x="280" y="420" width="720" height="60" rx="8" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1"/>
        <text x="640" y="455" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" fill="#374151">B. 긴장되고 피곤하다</text>
      </svg>
    `;

    await sharp(Buffer.from(desktopMbtiSvg)).png().toFile(path.join(outputDir, 'desktop-mbti.png'));
    console.log('✓ desktop-mbti.png 생성 완료');
  } catch (error) {
    console.error('스크린샷 생성 오류:', error);
  }
}

// Shortcut 아이콘 생성 함수
async function generateShortcutIcons() {
  const outputDir = path.join(__dirname, '../images/shortcuts');

  try {
    // shortcuts 디렉토리 생성
    await fs.mkdir(outputDir, { recursive: true });

    // MBTI 아이콘
    const mbtiIconSvg = `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="20" fill="#6366f1"/>
        <text x="48" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
              text-anchor="middle" fill="white">M</text>
        <text x="48" y="55" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
              text-anchor="middle" fill="white">B</text>
        <text x="48" y="75" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
              text-anchor="middle" fill="white">TI</text>
      </svg>
    `;

    await sharp(Buffer.from(mbtiIconSvg)).png().toFile(path.join(outputDir, 'mbti-icon.png'));
    console.log('✓ mbti-icon.png 생성 완료');

    // 테토-에겐 아이콘
    const tetoIconSvg = `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="20" fill="#10b981"/>
        <text x="48" y="40" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
              text-anchor="middle" fill="white">테토</text>
        <text x="48" y="65" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
              text-anchor="middle" fill="white">에겐</text>
      </svg>
    `;

    await sharp(Buffer.from(tetoIconSvg)).png().toFile(path.join(outputDir, 'teto-icon.png'));
    console.log('✓ teto-icon.png 생성 완료');

    // 사주 아이콘
    const sajuIconSvg = `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="20" fill="#f59e0b"/>
        <circle cx="48" cy="35" r="12" fill="none" stroke="white" stroke-width="2"/>
        <text x="48" y="65" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
              text-anchor="middle" fill="white">사주</text>
      </svg>
    `;

    await sharp(Buffer.from(sajuIconSvg)).png().toFile(path.join(outputDir, 'saju-icon.png'));
    console.log('✓ saju-icon.png 생성 완료');

    // 도구 아이콘
    const toolsIconSvg = `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="20" fill="#8b5cf6"/>
        <rect x="25" y="35" width="46" height="6" rx="3" fill="white"/>
        <rect x="25" y="45" width="36" height="6" rx="3" fill="white"/>
        <rect x="25" y="55" width="26" height="6" rx="3" fill="white"/>
        <text x="48" y="80" font-family="Arial, sans-serif" font-size="10" font-weight="bold" 
              text-anchor="middle" fill="white">도구</text>
      </svg>
    `;

    await sharp(Buffer.from(toolsIconSvg)).png().toFile(path.join(outputDir, 'tools-icon.png'));
    console.log('✓ tools-icon.png 생성 완료');
  } catch (error) {
    console.error('Shortcut 아이콘 생성 오류:', error);
  }
}

// 스크립트 실행
async function main() {
  console.log('PWA 스크린샷 및 아이콘 생성 시작...\n');

  await generateScreenshots();
  console.log('\n스크린샷 생성 완료!\n');

  await generateShortcutIcons();
  console.log('\nShortcut 아이콘 생성 완료!\n');

  console.log('모든 PWA 자산이 성공적으로 생성되었습니다! 🎉');
}

main().catch(console.error);
