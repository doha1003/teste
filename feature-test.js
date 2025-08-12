/**
 * 실제 기능 동작 테스트
 * 페이지별 주요 기능이 실제로 작동하는지 검증
 */

import puppeteer from 'puppeteer';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 간단한 정적 파일 서버
function createServer() {
  return http.createServer((req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(__dirname, url);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
}

async function testFeatures() {
  const server = createServer();
  const port = 3002;
  server.listen(port);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  try {
    console.log('🧪 기능 테스트 시작...\n');
    
    // 1. 홈페이지 탭 전환 테스트
    console.log('📍 홈페이지 탭 전환 테스트...');
    const page1 = await browser.newPage();
    await page1.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    
    try {
      // 심리테스트 탭 클릭
      await page1.click('[data-tab="test"]');
      await page1.evaluate(() => new Promise(r => setTimeout(r, 500)));
      
      // 심리테스트 카드만 보이는지 확인
      const visibleCards = await page1.$$eval('.service-card[data-category="test"]', 
        cards => cards.filter(card => card.style.display !== 'none').length
      );
      
      results.push({
        test: '홈페이지 탭 전환',
        status: visibleCards > 0 ? 'success' : 'fail',
        details: `${visibleCards}개 카드 표시됨`
      });
    } catch (e) {
      results.push({
        test: '홈페이지 탭 전환',
        status: 'fail',
        details: e.message
      });
    }
    await page1.close();
    
    // 2. MBTI 테스트 문항 선택
    console.log('📍 MBTI 테스트 문항 선택...');
    const page2 = await browser.newPage();
    await page2.goto('http://localhost:3002/tests/mbti/test.html', { waitUntil: 'networkidle0' });
    
    try {
      // 첫 번째 문항 선택
      const firstOption = await page2.$('.option-button, input[type="radio"]');
      if (firstOption) {
        await firstOption.click();
        await page2.evaluate(() => new Promise(r => setTimeout(r, 300)));
        
        // 진행률 확인
        const progress = await page2.$eval('.progress-fill, .progress-bar', 
          el => el.style.width || '0%'
        ).catch(() => '0%');
        
        results.push({
          test: 'MBTI 문항 선택',
          status: 'success',
          details: `진행률: ${progress}`
        });
      } else {
        results.push({
          test: 'MBTI 문항 선택',
          status: 'fail',
          details: '선택 버튼을 찾을 수 없음'
        });
      }
    } catch (e) {
      results.push({
        test: 'MBTI 문항 선택',
        status: 'fail',
        details: e.message
      });
    }
    await page2.close();
    
    // 3. BMI 계산기 테스트
    console.log('📍 BMI 계산기 테스트...');
    const page3 = await browser.newPage();
    await page3.goto('http://localhost:3002/tools/bmi-calculator.html', { waitUntil: 'networkidle0' });
    
    try {
      // 키와 몸무게 입력
      await page3.type('#height', '170');
      await page3.type('#weight', '65');
      
      // 계산 버튼 클릭
      await page3.click('#calculate-btn, button[type="submit"]');
      await page3.evaluate(() => new Promise(r => setTimeout(r, 500)));
      
      // 결과 확인
      const resultVisible = await page3.$eval('#result, .result-section', 
        el => window.getComputedStyle(el).display !== 'none'
      ).catch(() => false);
      
      results.push({
        test: 'BMI 계산',
        status: resultVisible ? 'success' : 'fail',
        details: resultVisible ? '결과 표시됨' : '결과 표시 안됨'
      });
    } catch (e) {
      results.push({
        test: 'BMI 계산',
        status: 'fail',
        details: e.message
      });
    }
    await page3.close();
    
    // 4. 글자수 세기 테스트
    console.log('📍 글자수 세기 테스트...');
    const page4 = await browser.newPage();
    await page4.goto('http://localhost:3002/tools/text-counter.html', { waitUntil: 'networkidle0' });
    
    try {
      // 텍스트 입력
      const testText = '안녕하세요 테스트입니다';
      await page4.type('#text-input, textarea', testText);
      await page4.evaluate(() => new Promise(r => setTimeout(r, 300)));
      
      // 카운트 확인
      const charCount = await page4.$eval('#char-count, .char-count', 
        el => el.textContent
      ).catch(() => '0');
      
      results.push({
        test: '글자수 세기',
        status: parseInt(charCount) > 0 ? 'success' : 'fail',
        details: `${charCount}자 카운트됨`
      });
    } catch (e) {
      results.push({
        test: '글자수 세기',
        status: 'fail',
        details: e.message
      });
    }
    await page4.close();
    
    // 5. 오늘의 운세 폼 검증
    console.log('📍 오늘의 운세 폼 검증...');
    const page5 = await browser.newPage();
    await page5.goto('http://localhost:3002/fortune/daily/', { waitUntil: 'networkidle0' });
    
    try {
      // 폼 요소 확인
      const hasNameInput = await page5.$('#name, input[name="name"]') !== null;
      const hasBirthInput = await page5.$('#birthDate, input[type="date"]') !== null;
      const hasGenderSelect = await page5.$('#gender, select[name="gender"]') !== null;
      const hasSubmitButton = await page5.$('button[type="submit"], #submit-btn') !== null;
      
      const formComplete = hasNameInput && hasBirthInput && hasGenderSelect && hasSubmitButton;
      
      results.push({
        test: '운세 폼 요소',
        status: formComplete ? 'success' : 'fail',
        details: `이름:${hasNameInput}, 생일:${hasBirthInput}, 성별:${hasGenderSelect}, 제출:${hasSubmitButton}`
      });
    } catch (e) {
      results.push({
        test: '운세 폼 요소',
        status: 'fail',
        details: e.message
      });
    }
    await page5.close();
    
  } catch (error) {
    console.error('테스트 오류:', error);
  } finally {
    await browser.close();
    server.close();
    
    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('📊 기능 테스트 결과');
    console.log('='.repeat(50));
    
    let successCount = 0;
    let failCount = 0;
    
    results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.details}`);
      
      if (result.status === 'success') successCount++;
      else failCount++;
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`총 ${results.length}개 테스트`);
    console.log(`✅ 성공: ${successCount}`);
    console.log(`❌ 실패: ${failCount}`);
    console.log(`성공률: ${((successCount / results.length) * 100).toFixed(1)}%`);
    
    if (failCount === 0) {
      console.log('🎉 모든 기능이 정상 작동합니다!');
    } else if (successCount > failCount) {
      console.log('⚠️ 일부 기능에 문제가 있습니다.');
    } else {
      console.log('🚨 대부분의 기능이 작동하지 않습니다.');
    }
  }
}

testFeatures().catch(console.error);