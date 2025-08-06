/**
 * 심리테스트 3개 JavaScript 오류 수정 검증 테스트
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testPsychologyTests() {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const results = {};

  const tests = [
    {
      name: '테토-에겐 테스트',
      url: 'http://localhost:3000/tests/teto-egen/test.html',
      startButtonSelector: '.test-start-button',
      expectedElements: ['#intro-screen', '#test-screen', '#question']
    },
    {
      name: '러브 DNA 테스트',
      url: 'http://localhost:3000/tests/love-dna/test.html',
      startButtonSelector: '.test-start-button',
      expectedElements: ['#intro-screen', '#test-screen', '#question']
    },
    {
      name: 'MBTI 테스트',
      url: 'http://localhost:3000/tests/mbti/test.html',
      startButtonSelector: '.test-start-button',
      expectedElements: ['#intro-screen', '#test-screen', '#question']
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 테스트 시작: ${test.name}`);
    
    try {
      const page = await browser.newPage();
      
      // 콘솔 에러 캐치
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // 페이지 로드
      await page.goto(test.url, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // 2초 대기 (모듈 로딩 시간)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 1. 페이지 로드 검증
      const title = await page.title();
      console.log(`   📄 페이지 제목: ${title}`);

      // 2. 시작 버튼 존재 확인
      const startButton = await page.$(test.startButtonSelector);
      console.log(`   🔘 시작 버튼: ${startButton ? '✅ 존재' : '❌ 없음'}`);

      // 3. 시작 버튼 클릭
      if (startButton) {
        await startButton.click();
        
        // 클릭 후 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. 테스트 화면 표시 확인
        const testScreen = await page.$('#test-screen');
        const isTestScreenVisible = testScreen && await page.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && !el.classList.contains('hidden');
        }, testScreen);

        console.log(`   🎮 테스트 화면: ${isTestScreenVisible ? '✅ 표시됨' : '❌ 숨겨짐'}`);

        // 5. 첫 질문 표시 확인
        const questionElement = await page.$('#question');
        const questionText = questionElement ? await page.evaluate(el => el.textContent.trim(), questionElement) : '';
        
        console.log(`   ❓ 첫 질문: ${questionText ? '✅ 표시됨' : '❌ 없음'}`);
        if (questionText) {
          console.log(`      "${questionText.substring(0, 50)}..."`);
        }

        // 6. 옵션 버튼 확인
        const options = await page.$$('.option, .teto-option, .love-option, .mbti-option');
        console.log(`   🎯 선택 옵션: ${options.length}개`);
      }

      // 7. JavaScript 오류 확인
      console.log(`   🚨 JavaScript 오류: ${consoleErrors.length}개`);
      if (consoleErrors.length > 0) {
        consoleErrors.forEach(error => console.log(`      - ${error}`));
      }

      results[test.name] = {
        success: startButton && consoleErrors.length === 0,
        errors: consoleErrors,
        title: title
      };

      await page.close();
      
    } catch (error) {
      console.log(`   ❌ 테스트 실패: ${error.message}`);
      results[test.name] = {
        success: false,
        errors: [error.message],
        title: null
      };
    }
  }

  await browser.close();

  // 결과 요약
  console.log('\n📊 테스트 결과 요약:');
  console.log('═'.repeat(50));
  
  let totalSuccess = 0;
  for (const [testName, result] of Object.entries(results)) {
    const status = result.success ? '✅ 성공' : '❌ 실패';
    console.log(`${testName}: ${status}`);
    if (result.success) totalSuccess++;
  }

  console.log(`\n총 ${Object.keys(results).length}개 테스트 중 ${totalSuccess}개 성공`);

  // 결과를 파일로 저장
  const timestamp = Date.now();
  const reportPath = `psychology-tests-fix-report-${timestamp}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 상세 결과: ${reportPath}`);

  return results;
}

// 로컬 서버가 실행 중인지 확인
async function checkLocalServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 메인 실행
async function main() {
  console.log('🔧 심리테스트 JavaScript 오류 수정 검증');
  console.log('═'.repeat(50));

  // 로컬 서버 확인
  const serverRunning = await checkLocalServer();
  if (!serverRunning) {
    console.log('❌ 로컬 서버가 실행되지 않았습니다.');
    console.log('다음 명령어로 서버를 시작하세요:');
    console.log('   python -m http.server 3000');
    return;
  }

  console.log('✅ 로컬 서버 확인됨 (http://localhost:3000)');

  await testPsychologyTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPsychologyTests };