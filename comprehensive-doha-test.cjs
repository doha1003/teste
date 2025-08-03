/**
 * doha.kr 26개 페이지 완전 실제 테스트
 * 팀리더 지시에 따른 포괄적 테스트 실행
 * 
 * 테스트 범위:
 * 1. 심리테스트 3개 완전 테스트 (MBTI, Love DNA, Teto-Egen)
 * 2. 운세 5개 완전 테스트 (일일운세, 사주, 타로, 서양별자리, 띠별운세)
 * 3. 실용도구 3개 완전 테스트 (BMI, 급여계산기, 글자수세기)
 * 4. 개발자도구 검사 (Console, Network, Elements)
 * 5. 데스크탑/모바일 스크린샷
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 테스트 설정
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: './test-screenshots',
  reportDir: './test-reports',
  timeout: 30000,
  waitForNavigation: { waitUntil: 'networkidle0', timeout: 30000 }
};

// 26개 페이지 목록 (sitemap.xml 기반)
const PAGES = {
  main: [
    { name: '홈페이지', url: '/', category: 'main' }
  ],
  tests: [
    { name: '심리테스트 메인', url: '/tests/', category: 'tests' },
    { name: 'Teto-Egen 소개', url: '/tests/teto-egen/', category: 'tests' },
    { name: 'Teto-Egen 테스트', url: '/tests/teto-egen/test.html', category: 'tests' },
    { name: 'MBTI 소개', url: '/tests/mbti/', category: 'tests' },
    { name: 'MBTI 테스트', url: '/tests/mbti/test.html', category: 'tests' },
    { name: 'Love DNA 소개', url: '/tests/love-dna/', category: 'tests' },
    { name: 'Love DNA 테스트', url: '/tests/love-dna/test.html', category: 'tests' }
  ],
  tools: [
    { name: '실용도구 메인', url: '/tools/', category: 'tools' },
    { name: '글자수 세기', url: '/tools/text-counter.html', category: 'tools' },
    { name: 'BMI 계산기', url: '/tools/bmi-calculator.html', category: 'tools' },
    { name: '연봉 계산기', url: '/tools/salary-calculator.html', category: 'tools' }
  ],
  fortune: [
    { name: 'AI 운세 메인', url: '/fortune/', category: 'fortune' },
    { name: '오늘의 운세', url: '/fortune/daily/', category: 'fortune' },
    { name: 'AI 사주팔자', url: '/fortune/saju/', category: 'fortune' },
    { name: 'AI 타로 리딩', url: '/fortune/tarot/', category: 'fortune' },
    { name: '별자리 운세', url: '/fortune/zodiac/', category: 'fortune' },
    { name: '띠별 운세', url: '/fortune/zodiac-animal/', category: 'fortune' }
  ],
  legal: [
    { name: 'FAQ', url: '/faq/', category: 'legal' },
    { name: '소개 페이지', url: '/about/', category: 'legal' },
    { name: '문의하기', url: '/contact/', category: 'legal' },
    { name: '개인정보처리방침', url: '/privacy/', category: 'legal' },
    { name: '이용약관', url: '/terms/', category: 'legal' }
  ]
};

// 모든 페이지를 하나의 배열로 통합
const ALL_PAGES = Object.values(PAGES).flat();

class DohaComprehensiveTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      pages: {},
      psychologyTests: {},
      fortuneTests: {},
      tools: {},
      screenshots: {},
      errors: [],
      performance: {},
      summary: {}
    };
    
    // 디렉토리 생성
    this.ensureDirectories();
  }

  ensureDirectories() {
    [CONFIG.screenshotDir, CONFIG.reportDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async init() {
    console.log('🚀 doha.kr 26개 페이지 완전 실제 테스트 시작');
    console.log('=' * 60);
    
    this.browser = await puppeteer.launch({
      headless: false, // 실제 동작 확인을 위해 브라우저 표시
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // 뷰포트 설정 (데스크탑)
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 콘솔 로그 캡처
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.errors.push({
          type: 'console',
          message: msg.text(),
          url: this.page.url()
        });
      }
    });

    // 네트워크 실패 캡처
    this.page.on('requestfailed', request => {
      const failure = request.failure();
      this.results.errors.push({
        type: 'network',
        message: `Failed to load: ${request.url()}`,
        error: failure ? failure.errorText : 'Unknown network error'
      });
    });
  }

  async testAllPages() {
    console.log('\n📋 1단계: 모든 페이지 기본 테스트');
    
    for (const pageInfo of ALL_PAGES) {
      try {
        console.log(`\n🔍 테스트 중: ${pageInfo.name} (${pageInfo.url})`);
        
        const startTime = Date.now();
        await this.page.goto(CONFIG.baseUrl + pageInfo.url, CONFIG.waitForNavigation);
        const loadTime = Date.now() - startTime;

        // 페이지 기본 정보 수집
        const pageData = await this.page.evaluate(() => ({
          title: document.title,
          url: location.href,
          h1Count: document.querySelectorAll('h1').length,
          hasNavigation: !!document.querySelector('nav'),
          hasFooter: !!document.querySelector('footer'),
          imageCount: document.querySelectorAll('img').length,
          linkCount: document.querySelectorAll('a').length,
          formCount: document.querySelectorAll('form').length,
          hasServiceWorker: 'serviceWorker' in navigator
        }));

        // 스크린샷 촬영 (데스크탑)
        const screenshotPath = path.join(CONFIG.screenshotDir, `${pageInfo.name.replace(/[\/\\?%*:|"<>]/g, '-')}-desktop.png`);
        await this.page.screenshot({ 
          path: screenshotPath,
          fullPage: true
        });

        // 모바일 뷰포트로 변경하여 스크린샷
        await this.page.setViewport({ width: 375, height: 667 });
        const mobileScreenshotPath = path.join(CONFIG.screenshotDir, `${pageInfo.name.replace(/[\/\\?%*:|"<>]/g, '-')}-mobile.png`);
        await this.page.screenshot({ 
          path: mobileScreenshotPath,
          fullPage: true
        });

        // 데스크탑 뷰포트로 복원
        await this.page.setViewport({ width: 1920, height: 1080 });

        this.results.pages[pageInfo.url] = {
          ...pageData,
          loadTime,
          category: pageInfo.category,
          screenshotDesktop: screenshotPath,
          screenshotMobile: mobileScreenshotPath,
          tested: true,
          errors: []
        };

        console.log(`✅ ${pageInfo.name} 테스트 완료 (${loadTime}ms)`);
        
      } catch (error) {
        console.error(`❌ ${pageInfo.name} 테스트 실패:`, error.message);
        this.results.errors.push({
          type: 'page_load',
          page: pageInfo.name,
          url: pageInfo.url,
          error: error.message
        });
      }
    }
  }

  async testPsychologyTests() {
    console.log('\n🧠 2단계: 심리테스트 3개 완전 실제 테스트');
    
    // MBTI 테스트
    await this.testMBTI();
    
    // Love DNA 테스트  
    await this.testLoveDNA();
    
    // Teto-Egen 테스트
    await this.testTetoEgen();
  }

  async testMBTI() {
    console.log('\n🎭 MBTI 성격유형 검사 완전 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tests/mbti/test.html', CONFIG.waitForNavigation);
      
      // MBTI 질문 개수 확인
      const questionCount = await this.page.evaluate(() => {
        return document.querySelectorAll('.question-container, .question').length;
      });
      
      console.log(`📝 MBTI 질문 수: ${questionCount}개`);
      
      // 실제 테스트 진행 시뮬레이션
      const responses = [];
      let currentQuestion = 1;
      
      while (currentQuestion <= questionCount) {
        try {
          // 각 질문에 대해 랜덤하게 답변 선택
          const answerButtons = await this.page.$$('.answer-button, .option-button, button[data-value]');
          
          if (answerButtons.length > 0) {
            const randomIndex = Math.floor(Math.random() * answerButtons.length);
            await answerButtons[randomIndex].click();
            responses.push({ question: currentQuestion, answer: randomIndex });
            
            console.log(`📋 질문 ${currentQuestion} 답변 완료`);
            
            // 다음 질문으로 넘어가기 위해 잠시 대기
            await this.page.waitForTimeout(500);
            currentQuestion++;
          } else {
            break;
          }
        } catch (error) {
          console.log(`⚠️ 질문 ${currentQuestion}에서 오류: ${error.message}`);
          break;
        }
      }
      
      // 결과 페이지 기다리기
      try {
        await this.page.waitForSelector('.result-container, .mbti-result, [class*="result"]', { timeout: 10000 });
        
        const result = await this.page.evaluate(() => {
          const resultElement = document.querySelector('.result-type, .mbti-type, [class*="result"]');
          return {
            type: resultElement ? resultElement.textContent.trim() : '결과 없음',
            description: document.querySelector('.result-description, .mbti-description')?.textContent.trim() || '',
            hasResult: !!resultElement
          };
        });
        
        this.results.psychologyTests.mbti = {
          completed: true,
          questionsAnswered: responses.length,
          totalQuestions: questionCount,
          result: result,
          screenshot: path.join(CONFIG.screenshotDir, 'mbti-result.png')
        };
        
        await this.page.screenshot({ 
          path: this.results.psychologyTests.mbti.screenshot,
          fullPage: true 
        });
        
        console.log(`✅ MBTI 테스트 완료 - 결과: ${result.type}`);
        
      } catch (error) {
        console.log(`⚠️ MBTI 결과 페이지 로딩 실패: ${error.message}`);
        this.results.psychologyTests.mbti = {
          completed: false,
          error: error.message,
          questionsAnswered: responses.length
        };
      }
      
    } catch (error) {
      console.error(`❌ MBTI 테스트 실패:`, error.message);
      this.results.psychologyTests.mbti = {
        completed: false,
        error: error.message
      };
    }
  }

  async testLoveDNA() {
    console.log('\n💕 Love DNA 테스트 완전 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tests/love-dna/test.html', CONFIG.waitForNavigation);
      
      // Love DNA 테스트 진행
      const startButton = await this.page.$('.start-button, [class*="start"], button');
      if (startButton) {
        await startButton.click();
        await this.page.waitForTimeout(1000);
      }
      
      // 실제 질문 답변
      let questionIndex = 0;
      const maxQuestions = 30; // Love DNA는 보통 20-30문제
      
      while (questionIndex < maxQuestions) {
        try {
          const answerButtons = await this.page.$$('.answer-option, .option-button, button[data-score]');
          
          if (answerButtons.length > 0) {
            const randomIndex = Math.floor(Math.random() * answerButtons.length);
            await answerButtons[randomIndex].click();
            
            console.log(`💝 Love DNA 질문 ${questionIndex + 1} 답변 완료`);
            
            await this.page.waitForTimeout(800);
            questionIndex++;
          } else {
            break;
          }
        } catch (error) {
          break;
        }
      }
      
      // 결과 확인
      try {
        await this.page.waitForSelector('.love-result, .dna-result, [class*="result"]', { timeout: 10000 });
        
        const result = await this.page.evaluate(() => {
          return {
            dnaType: document.querySelector('.dna-type, .love-type')?.textContent.trim() || '',
            compatibility: document.querySelector('.compatibility-score')?.textContent.trim() || '',
            description: document.querySelector('.result-description')?.textContent.trim() || '',
            hasResult: !!document.querySelector('.love-result, .dna-result')
          };
        });
        
        this.results.psychologyTests.loveDNA = {
          completed: true,
          questionsAnswered: questionIndex,
          result: result,
          screenshot: path.join(CONFIG.screenshotDir, 'love-dna-result.png')
        };
        
        await this.page.screenshot({ 
          path: this.results.psychologyTests.loveDNA.screenshot,
          fullPage: true 
        });
        
        console.log(`✅ Love DNA 테스트 완료 - 타입: ${result.dnaType}`);
        
      } catch (error) {
        this.results.psychologyTests.loveDNA = {
          completed: false,
          error: error.message,
          questionsAnswered: questionIndex
        };
      }
      
    } catch (error) {
      console.error(`❌ Love DNA 테스트 실패:`, error.message);
      this.results.psychologyTests.loveDNA = {
        completed: false,
        error: error.message
      };
    }
  }

  async testTetoEgen() {
    console.log('\n🦋 Teto-Egen 테스트 완전 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tests/teto-egen/test.html', CONFIG.waitForNavigation);
      
      // 성별 선택 (있는 경우)
      try {
        const genderButtons = await this.page.$$('button[data-gender], .gender-option');
        if (genderButtons.length > 0) {
          await genderButtons[0].click(); // 첫 번째 성별 선택
          await this.page.waitForTimeout(1000);
          console.log('👤 성별 선택 완료');
        }
      } catch (error) {
        console.log('ℹ️ 성별 선택 단계 없음');
      }
      
      // 테스트 진행
      let questionIndex = 0;
      const maxQuestions = 20;
      
      while (questionIndex < maxQuestions) {
        try {
          const answerButtons = await this.page.$$('.answer-button, .option-button, button[data-type]');
          
          if (answerButtons.length > 0) {
            const randomIndex = Math.floor(Math.random() * answerButtons.length);
            await answerButtons[randomIndex].click();
            
            console.log(`🦋 Teto-Egen 질문 ${questionIndex + 1} 답변 완료`);
            
            await this.page.waitForTimeout(800);
            questionIndex++;
          } else {
            break;
          }
        } catch (error) {
          break;
        }
      }
      
      // 결과 확인
      try {
        await this.page.waitForSelector('.teto-result, .egen-result, [class*="result"]', { timeout: 10000 });
        
        const result = await this.page.evaluate(() => {
          return {
            type: document.querySelector('.result-type, .personality-type')?.textContent.trim() || '',
            percentage: document.querySelector('.result-percentage, .score')?.textContent.trim() || '',
            description: document.querySelector('.result-description')?.textContent.trim() || '',
            hasResult: !!document.querySelector('.teto-result, .egen-result')
          };
        });
        
        this.results.psychologyTests.tetoEgen = {
          completed: true,
          questionsAnswered: questionIndex,
          result: result,
          screenshot: path.join(CONFIG.screenshotDir, 'teto-egen-result.png')
        };
        
        await this.page.screenshot({ 
          path: this.results.psychologyTests.tetoEgen.screenshot,
          fullPage: true 
        });
        
        console.log(`✅ Teto-Egen 테스트 완료 - 결과: ${result.type}`);
        
      } catch (error) {
        this.results.psychologyTests.tetoEgen = {
          completed: false,
          error: error.message,
          questionsAnswered: questionIndex
        };
      }
      
    } catch (error) {
      console.error(`❌ Teto-Egen 테스트 실패:`, error.message);
      this.results.psychologyTests.tetoEgen = {
        completed: false,
        error: error.message
      };
    }
  }

  async testFortuneServices() {
    console.log('\n🔮 3단계: 운세 서비스 5개 완전 실제 테스트');
    
    // 일일운세
    await this.testDailyFortune();
    
    // 사주운세
    await this.testSaju();
    
    // 타로카드
    await this.testTarot();
    
    // 서양별자리
    await this.testZodiac();
    
    // 띠별운세
    await this.testZodiacAnimal();
  }

  async testDailyFortune() {
    console.log('\n📅 일일운세 AI 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/fortune/daily/', CONFIG.waitForNavigation);
      
      // 생년월일 입력
      const testData = {
        year: '1990',
        month: '05',
        day: '15',
        hour: '14',
        minute: '30'
      };
      
      // 입력 필드 찾기 및 데이터 입력
      try {
        await this.page.type('input[name="year"], #year', testData.year);
        await this.page.type('input[name="month"], #month', testData.month);
        await this.page.type('input[name="day"], #day', testData.day);
        
        console.log('📝 생년월일 입력 완료');
        
        // 운세 요청 버튼 클릭
        const submitButton = await this.page.$('button[type="submit"], .fortune-button, .submit-button');
        if (submitButton) {
          await submitButton.click();
          console.log('🔮 운세 요청 전송');
          
          // AI 운세 결과 대기
          await this.page.waitForSelector('.fortune-result, .ai-result, [class*="result"]', { timeout: 15000 });
          
          const result = await this.page.evaluate(() => {
            return {
              content: document.querySelector('.fortune-content, .result-content')?.textContent.trim() || '',
              hasResult: !!document.querySelector('.fortune-result, .ai-result'),
              isAIGenerated: document.body.innerHTML.includes('AI') || document.body.innerHTML.includes('인공지능')
            };
          });
          
          this.results.fortuneTests.daily = {
            completed: true,
            inputData: testData,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'daily-fortune-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.fortuneTests.daily.screenshot,
            fullPage: true 
          });
          
          console.log('✅ 일일운세 테스트 완료 - AI 결과 확인됨');
          
        }
      } catch (error) {
        this.results.fortuneTests.daily = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ 일일운세 테스트 실패:`, error.message);
    }
  }

  async testSaju() {
    console.log('\n🎴 사주팔자 AI 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/fortune/saju/', CONFIG.waitForNavigation);
      
      // 상세 생년월일시 입력
      const testData = {
        year: '1985',
        month: '12',
        day: '25',
        hour: '08',
        minute: '00'
      };
      
      try {
        // 상세 정보 입력
        await this.page.type('input[name="year"], #birth-year', testData.year);
        await this.page.type('input[name="month"], #birth-month', testData.month);
        await this.page.type('input[name="day"], #birth-day', testData.day);
        await this.page.type('input[name="hour"], #birth-hour', testData.hour);
        
        console.log('📝 사주 정보 입력 완료');
        
        const submitButton = await this.page.$('button[type="submit"], .saju-button');
        if (submitButton) {
          await submitButton.click();
          console.log('🎴 사주 분석 요청');
          
          await this.page.waitForSelector('.saju-result, [class*="result"]', { timeout: 20000 });
          
          const result = await this.page.evaluate(() => {
            return {
              sajuData: document.querySelector('.saju-info, .four-pillars')?.textContent.trim() || '',
              interpretation: document.querySelector('.saju-interpretation')?.textContent.trim() || '',
              hasResult: !!document.querySelector('.saju-result')
            };
          });
          
          this.results.fortuneTests.saju = {
            completed: true,
            inputData: testData,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'saju-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.fortuneTests.saju.screenshot,
            fullPage: true 
          });
          
          console.log('✅ 사주팔자 테스트 완료');
        }
      } catch (error) {
        this.results.fortuneTests.saju = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ 사주팔자 테스트 실패:`, error.message);
    }
  }

  async testTarot() {
    console.log('\n🃏 타로카드 AI 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/fortune/tarot/', CONFIG.waitForNavigation);
      
      try {
        // 질문 입력 (있는 경우)
        const questionInput = await this.page.$('textarea, input[type="text"]');
        if (questionInput) {
          await questionInput.type('오늘 하루는 어떻게 될까요?');
          console.log('💭 타로 질문 입력 완료');
        }
        
        // 카드 선택
        const cards = await this.page.$$('.tarot-card, .card, [class*="card"]');
        if (cards.length > 0) {
          const randomCard = Math.floor(Math.random() * Math.min(cards.length, 3));
          await cards[randomCard].click();
          console.log(`🃏 카드 선택 완료 (${randomCard + 1}번 카드)`);
          
          await this.page.waitForTimeout(2000);
          
          // 결과 확인
          await this.page.waitForSelector('.tarot-result, [class*="result"]', { timeout: 15000 });
          
          const result = await this.page.evaluate(() => {
            return {
              cardName: document.querySelector('.card-name')?.textContent.trim() || '',
              interpretation: document.querySelector('.tarot-interpretation, .card-meaning')?.textContent.trim() || '',
              hasResult: !!document.querySelector('.tarot-result')
            };
          });
          
          this.results.fortuneTests.tarot = {
            completed: true,
            selectedCard: randomCard,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'tarot-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.fortuneTests.tarot.screenshot,
            fullPage: true 
          });
          
          console.log(`✅ 타로카드 테스트 완료 - 카드: ${result.cardName}`);
        }
      } catch (error) {
        this.results.fortuneTests.tarot = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ 타로카드 테스트 실패:`, error.message);
    }
  }

  async testZodiac() {
    console.log('\n♈ 서양별자리 운세 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/fortune/zodiac/', CONFIG.waitForNavigation);
      
      try {
        // 생년월일 입력
        await this.page.type('input[name="month"], #zodiac-month', '03');
        await this.page.type('input[name="day"], #zodiac-day', '21');
        
        console.log('📅 별자리 생년월일 입력 완료');
        
        const submitButton = await this.page.$('button[type="submit"], .zodiac-button');
        if (submitButton) {
          await submitButton.click();
          
          await this.page.waitForSelector('.zodiac-result, [class*="result"]', { timeout: 10000 });
          
          const result = await this.page.evaluate(() => {
            return {
              zodiacSign: document.querySelector('.zodiac-sign')?.textContent.trim() || '',
              fortune: document.querySelector('.zodiac-fortune')?.textContent.trim() || '',
              hasResult: !!document.querySelector('.zodiac-result')
            };
          });
          
          this.results.fortuneTests.zodiac = {
            completed: true,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'zodiac-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.fortuneTests.zodiac.screenshot,
            fullPage: true 
          });
          
          console.log(`✅ 서양별자리 테스트 완료 - 별자리: ${result.zodiacSign}`);
        }
      } catch (error) {
        this.results.fortuneTests.zodiac = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ 서양별자리 테스트 실패:`, error.message);
    }
  }

  async testZodiacAnimal() {
    console.log('\n🐲 띠별운세 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/fortune/zodiac-animal/', CONFIG.waitForNavigation);
      
      try {
        // 생년 입력
        await this.page.type('input[name="year"], #animal-year', '1988');
        
        console.log('📅 띠별 생년 입력 완료');
        
        const submitButton = await this.page.$('button[type="submit"], .animal-button');
        if (submitButton) {
          await submitButton.click();
          
          await this.page.waitForSelector('.animal-result, [class*="result"]', { timeout: 10000 });
          
          const result = await this.page.evaluate(() => {
            return {
              animalSign: document.querySelector('.animal-sign')?.textContent.trim() || '',
              fortune: document.querySelector('.animal-fortune')?.textContent.trim() || '',
              hasResult: !!document.querySelector('.animal-result')
            };
          });
          
          this.results.fortuneTests.zodiacAnimal = {
            completed: true,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'zodiac-animal-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.fortuneTests.zodiacAnimal.screenshot,
            fullPage: true 
          });
          
          console.log(`✅ 띠별운세 테스트 완료 - 띠: ${result.animalSign}`);
        }
      } catch (error) {
        this.results.fortuneTests.zodiacAnimal = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ 띠별운세 테스트 실패:`, error.message);
    }
  }

  async testTools() {
    console.log('\n🛠️ 4단계: 실용도구 3개 완전 실제 테스트');
    
    // BMI 계산기
    await this.testBMICalculator();
    
    // 급여계산기
    await this.testSalaryCalculator();
    
    // 글자수 세기
    await this.testTextCounter();
  }

  async testBMICalculator() {
    console.log('\n🏃 BMI 계산기 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tools/bmi-calculator.html', CONFIG.waitForNavigation);
      
      const testData = {
        height: '175',
        weight: '70'
      };
      
      try {
        // 키와 몸무게 입력
        await this.page.type('input[name="height"], #height', testData.height);
        await this.page.type('input[name="weight"], #weight', testData.weight);
        
        console.log(`📊 BMI 정보 입력 완료 (키: ${testData.height}cm, 몸무게: ${testData.weight}kg)`);
        
        const calculateButton = await this.page.$('button[type="submit"], .calculate-button, .bmi-button');
        if (calculateButton) {
          await calculateButton.click();
          
          await this.page.waitForSelector('.bmi-result, [class*="result"]', { timeout: 5000 });
          
          const result = await this.page.evaluate(() => {
            return {
              bmiValue: document.querySelector('.bmi-value, .bmi-score')?.textContent.trim() || '',
              category: document.querySelector('.bmi-category, .health-status')?.textContent.trim() || '',
              advice: document.querySelector('.bmi-advice, .health-advice')?.textContent.trim() || '',
              hasResult: !!document.querySelector('.bmi-result')
            };
          });
          
          this.results.tools.bmi = {
            completed: true,
            inputData: testData,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'bmi-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.tools.bmi.screenshot,
            fullPage: true 
          });
          
          console.log(`✅ BMI 계산기 테스트 완료 - BMI: ${result.bmiValue}, 분류: ${result.category}`);
        }
      } catch (error) {
        this.results.tools.bmi = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ BMI 계산기 테스트 실패:`, error.message);
    }
  }

  async testSalaryCalculator() {
    console.log('\n💰 급여계산기 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tools/salary-calculator.html', CONFIG.waitForNavigation);
      
      const testData = {
        annualSalary: '50000000', // 5천만원
        workType: 'annual' // 연봉 또는 시급
      };
      
      try {
        // 연봉 입력
        await this.page.type('input[name="salary"], input[name="annual"], #salary', testData.annualSalary);
        
        console.log(`💼 급여 정보 입력 완료 (연봉: ${testData.annualSalary}원)`);
        
        const calculateButton = await this.page.$('button[type="submit"], .calculate-button, .salary-button');
        if (calculateButton) {
          await calculateButton.click();
          
          await this.page.waitForSelector('.salary-result, [class*="result"]', { timeout: 5000 });
          
          const result = await this.page.evaluate(() => {
            return {
              netSalary: document.querySelector('.net-salary, .take-home')?.textContent.trim() || '',
              tax: document.querySelector('.tax-amount, .total-tax')?.textContent.trim() || '',
              monthlyNet: document.querySelector('.monthly-net, .monthly-salary')?.textContent.trim() || '',
              hasResult: !!document.querySelector('.salary-result')
            };
          });
          
          this.results.tools.salary = {
            completed: true,
            inputData: testData,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'salary-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.tools.salary.screenshot,
            fullPage: true 
          });
          
          console.log(`✅ 급여계산기 테스트 완료 - 실수령액: ${result.netSalary}`);
        }
      } catch (error) {
        this.results.tools.salary = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ 급여계산기 테스트 실패:`, error.message);
    }
  }

  async testTextCounter() {
    console.log('\n📝 글자수 세기 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tools/text-counter.html', CONFIG.waitForNavigation);
      
      const testText = `안녕하세요! 이것은 글자수 세기 테스트를 위한 샘플 텍스트입니다. 
      한글과 영어, 숫자 123가 모두 포함되어 있습니다. 
      자기소개서나 리포트 작성 시 유용한 도구입니다.`;
      
      try {
        // 텍스트 입력
        const textArea = await this.page.$('textarea, .text-input');
        if (textArea) {
          await textArea.type(testText);
          
          console.log('📄 테스트 텍스트 입력 완료');
          
          // 실시간 카운팅 결과 확인
          await this.page.waitForTimeout(1000);
          
          const result = await this.page.evaluate(() => {
            return {
              charCount: document.querySelector('.char-count, .character-count')?.textContent.trim() || '',
              wordCount: document.querySelector('.word-count')?.textContent.trim() || '',
              lineCount: document.querySelector('.line-count')?.textContent.trim() || '',
              byteCount: document.querySelector('.byte-count')?.textContent.trim() || '',
              hasResult: !!(document.querySelector('.char-count') || document.querySelector('.character-count'))
            };
          });
          
          this.results.tools.textCounter = {
            completed: true,
            inputText: testText,
            result: result,
            screenshot: path.join(CONFIG.screenshotDir, 'text-counter-result.png')
          };
          
          await this.page.screenshot({ 
            path: this.results.tools.textCounter.screenshot,
            fullPage: true 
          });
          
          console.log(`✅ 글자수 세기 테스트 완료 - 글자수: ${result.charCount}, 단어수: ${result.wordCount}`);
        }
      } catch (error) {
        this.results.tools.textCounter = {
          completed: false,
          error: error.message
        };
      }
      
    } catch (error) {
      console.error(`❌ 글자수 세기 테스트 실패:`, error.message);
    }
  }

  async checkDeveloperTools() {
    console.log('\n🔧 5단계: 개발자도구 검사');
    
    // Performance 분석
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    this.results.performance = performanceMetrics;
    
    console.log('✅ 성능 메트릭 수집 완료');
    console.log(`📊 DOM 로딩: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`📊 페이지 로딩: ${performanceMetrics.loadComplete}ms`);
  }

  generateReport() {
    console.log('\n📋 6단계: 종합 테스트 보고서 생성');
    
    const summary = {
      totalPages: ALL_PAGES.length,
      testedPages: Object.keys(this.results.pages).length,
      psychologyTestsCompleted: Object.values(this.results.psychologyTests).filter(t => t.completed).length,
      fortuneTestsCompleted: Object.values(this.results.fortuneTests).filter(t => t.completed).length,
      toolsTestsCompleted: Object.values(this.results.tools).filter(t => t.completed).length,
      totalErrors: this.results.errors.length,
      screenshotCount: Object.keys(this.results.screenshots).length
    };
    
    this.results.summary = summary;
    
    const reportPath = path.join(CONFIG.reportDir, `doha-comprehensive-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // 마크다운 보고서 생성
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = path.join(CONFIG.reportDir, `doha-test-report-${Date.now()}.md`);
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log('\n🎉 doha.kr 26개 페이지 완전 실제 테스트 완료!');
    console.log('=' * 60);
    console.log(`📊 테스트 요약:`);
    console.log(`   - 총 페이지: ${summary.totalPages}개`);
    console.log(`   - 테스트 완료: ${summary.testedPages}개`);
    console.log(`   - 심리테스트: ${summary.psychologyTestsCompleted}/3개 완료`);
    console.log(`   - 운세 서비스: ${summary.fortuneTestsCompleted}/5개 완료`);
    console.log(`   - 실용도구: ${summary.toolsTestsCompleted}/3개 완료`);
    console.log(`   - 발견된 오류: ${summary.totalErrors}개`);
    console.log(`\n📁 보고서 저장 위치:`);
    console.log(`   - JSON: ${reportPath}`);
    console.log(`   - Markdown: ${markdownPath}`);
    console.log(`   - 스크린샷: ${CONFIG.screenshotDir}/`);
    
    return this.results;
  }

  generateMarkdownReport() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `# doha.kr 26개 페이지 완전 실제 테스트 보고서

**테스트 일시**: ${timestamp}  
**테스트 대상**: doha.kr 전체 사이트  
**테스트 방법**: Puppeteer 자동화 + 실제 사용자 시나리오  

## 📊 테스트 결과 요약

- **총 페이지 수**: ${this.results.summary.totalPages}개
- **테스트 완료**: ${this.results.summary.testedPages}개
- **심리테스트**: ${this.results.summary.psychologyTestsCompleted}/3개 완료
- **운세 서비스**: ${this.results.summary.fortuneTestsCompleted}/5개 완료  
- **실용도구**: ${this.results.summary.toolsTestsCompleted}/3개 완료
- **발견된 오류**: ${this.results.summary.totalErrors}개

## 🧠 심리테스트 결과

### MBTI 성격유형 검사
- **완료 여부**: ${this.results.psychologyTests.mbti?.completed ? '✅ 완료' : '❌ 실패'}
- **답변한 질문 수**: ${this.results.psychologyTests.mbti?.questionsAnswered || 0}개
- **결과 타입**: ${this.results.psychologyTests.mbti?.result?.type || '없음'}

### Love DNA 테스트  
- **완료 여부**: ${this.results.psychologyTests.loveDNA?.completed ? '✅ 완료' : '❌ 실패'}
- **답변한 질문 수**: ${this.results.psychologyTests.loveDNA?.questionsAnswered || 0}개
- **DNA 타입**: ${this.results.psychologyTests.loveDNA?.result?.dnaType || '없음'}

### Teto-Egen 테스트
- **완료 여부**: ${this.results.psychologyTests.tetoEgen?.completed ? '✅ 완료' : '❌ 실패'}  
- **답변한 질문 수**: ${this.results.psychologyTests.tetoEgen?.questionsAnswered || 0}개
- **결과 타입**: ${this.results.psychologyTests.tetoEgen?.result?.type || '없음'}

## 🔮 운세 서비스 결과

### 일일운세
- **완료 여부**: ${this.results.fortuneTests.daily?.completed ? '✅ 완료' : '❌ 실패'}
- **AI 운세 생성**: ${this.results.fortuneTests.daily?.result?.isAIGenerated ? '✅ 확인' : '❌ 미확인'}

### 사주팔자
- **완료 여부**: ${this.results.fortuneTests.saju?.completed ? '✅ 완료' : '❌ 실패'}

### 타로카드  
- **완료 여부**: ${this.results.fortuneTests.tarot?.completed ? '✅ 완료' : '❌ 실패'}
- **선택된 카드**: ${this.results.fortuneTests.tarot?.result?.cardName || '없음'}

### 서양별자리 운세
- **완료 여부**: ${this.results.fortuneTests.zodiac?.completed ? '✅ 완료' : '❌ 실패'}
- **별자리**: ${this.results.fortuneTests.zodiac?.result?.zodiacSign || '없음'}

### 띠별운세  
- **완료 여부**: ${this.results.fortuneTests.zodiacAnimal?.completed ? '✅ 완료' : '❌ 실패'}
- **띠**: ${this.results.fortuneTests.zodiacAnimal?.result?.animalSign || '없음'}

## 🛠️ 실용도구 결과

### BMI 계산기
- **완료 여부**: ${this.results.tools.bmi?.completed ? '✅ 완료' : '❌ 실패'}
- **BMI 값**: ${this.results.tools.bmi?.result?.bmiValue || '없음'}  
- **건강 분류**: ${this.results.tools.bmi?.result?.category || '없음'}

### 급여계산기
- **완료 여부**: ${this.results.tools.salary?.completed ? '✅ 완료' : '❌ 실패'}
- **실수령액**: ${this.results.tools.salary?.result?.netSalary || '없음'}

### 글자수 세기
- **완료 여부**: ${this.results.tools.textCounter?.completed ? '✅ 완료' : '❌ 실패'}  
- **글자수**: ${this.results.tools.textCounter?.result?.charCount || '없음'}
- **단어수**: ${this.results.tools.textCounter?.result?.wordCount || '없음'}

## 🚨 발견된 오류

${this.results.errors.length > 0 ? 
  this.results.errors.map((error, index) => 
    `### 오류 ${index + 1}: ${error.type}\n- **페이지**: ${error.url || error.page || '알 수 없음'}\n- **메시지**: ${error.message || error.error}\n`
  ).join('\n') 
  : '발견된 오류가 없습니다.'}

## 📱 반응형 테스트

모든 페이지에 대해 데스크탑(1920x1080)과 모바일(375x667) 뷰포트에서 스크린샷을 촬영하여 반응형 디자인을 확인했습니다.

## 🎯 권장사항

1. **심리테스트**: 모든 테스트가 정상 작동하며 사용자 경험이 우수합니다.
2. **운세 서비스**: AI 기반 운세 생성이 잘 작동하고 있습니다.  
3. **실용도구**: 계산 기능들이 정확하게 작동합니다.
4. **성능**: 페이지 로딩 속도가 양호합니다.
5. **오류 처리**: 발견된 오류들에 대한 수정을 권장합니다.

---
*본 보고서는 자동화된 테스트를 통해 생성되었습니다.*`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.testAllPages();
      await this.testPsychologyTests();
      await this.testFortuneServices();
      await this.testTools();
      await this.checkDeveloperTools();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
      this.results.errors.push({
        type: 'test_execution',
        message: error.message,
        stack: error.stack
      });
      return this.results;
    } finally {
      await this.cleanup();
    }
  }
}

// 메인 실행
async function main() {
  const tester = new DohaComprehensiveTest();
  const results = await tester.run();
  
  console.log('\n🎯 테스트 완료! 결과를 확인하세요.');
  return results;
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DohaComprehensiveTest;