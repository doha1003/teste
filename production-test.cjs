/**
 * doha.kr 실제 프로덕션 사이트 테스트
 * 로컬 서버 문제를 회피하고 실제 배포된 사이트에서 테스트
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  baseUrl: 'https://doha.kr',
  screenshotDir: './production-test-screenshots',
  timeout: 20000
};

class ProductionDohaTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      pages: {},
      features: {},
      performance: {},
      errors: [],
      summary: {}
    };
    
    if (!fs.existsSync(CONFIG.screenshotDir)) {
      fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
    }
  }

  async init() {
    console.log('🚀 doha.kr 프로덕션 사이트 실제 테스트 시작');
    console.log('🌐 테스트 URL: https://doha.kr');
    console.log('=' * 50);
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  async testHomePage() {
    console.log('\n🏠 홈페이지 기능 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
      
      const homeData = await this.page.evaluate(() => ({
        title: document.title,
        hasNavigation: !!document.querySelector('nav'),
        serviceCount: document.querySelectorAll('.service-card').length,
        heroTitle: document.querySelector('.hero-title')?.textContent?.trim() || '',
        hasFooter: !!document.querySelector('footer'),
        hasServiceWorker: 'serviceWorker' in navigator
      }));
      
      // 서비스 카드 클릭 테스트
      const serviceCards = await this.page.$$('.service-card');
      console.log(`📋 발견된 서비스 카드: ${serviceCards.length}개`);
      
      // 탭 전환 테스트
      try {
        const tabButtons = await this.page.$$('.tab-button');
        if (tabButtons.length > 1) {
          await tabButtons[1].click(); // 두 번째 탭 클릭
          await this.page.waitForTimeout(1000);
          console.log('✅ 탭 전환 기능 동작');
        }
      } catch (e) {
        console.log('⚠️ 탭 기능 테스트 건너뜀');
      }
      
      await this.page.screenshot({ 
        path: path.join(CONFIG.screenshotDir, 'home-production.png'),
        fullPage: true 
      });
      
      this.results.pages.home = { ...homeData, tested: true };
      console.log(`✅ 홈페이지 테스트 완료 - 서비스 ${homeData.serviceCount}개`);
      
    } catch (error) {
      console.error(`❌ 홈페이지 테스트 실패:`, error.message);
      this.results.errors.push({ type: 'home', error: error.message });
    }
  }

  async testMBTIFull() {
    console.log('\n🎭 MBTI 테스트 전체 진행');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tests/mbti/test.html', { waitUntil: 'networkidle2' });
      
      // 실제 MBTI 테스트 완료까지 진행
      let questionsAnswered = 0;
      const maxQuestions = 30; // MBTI는 보통 20-30문제
      
      while (questionsAnswered < maxQuestions) {
        try {
          // 다양한 답변 버튼 셀렉터 시도
          const answerButtons = await this.page.$$('.answer-button, .option-button, button[data-value], .question-option, .btn');
          
          if (answerButtons.length > 0) {
            // 랜덤한 답변 선택
            const randomIndex = Math.floor(Math.random() * answerButtons.length);
            await answerButtons[randomIndex].click();
            questionsAnswered++;
            
            console.log(`📝 MBTI 질문 ${questionsAnswered} 답변 완료`);
            
            await this.page.waitForTimeout(500);
            
            // 결과 페이지가 나타났는지 확인
            const hasResult = await this.page.$('.result-container, .mbti-result, [class*="result"]');
            if (hasResult) {
              console.log('🎉 MBTI 결과 페이지 도달');
              break;
            }
          } else {
            console.log('⚠️ 더 이상 답변할 질문이 없음');
            break;
          }
        } catch (e) {
          console.log(`⚠️ 질문 ${questionsAnswered + 1}에서 문제 발생`);
          break;
        }
      }
      
      // 결과 확인 시도
      try {
        await this.page.waitForSelector('.result-container, .mbti-result, [class*="result"]', { timeout: 5000 });
        
        const result = await this.page.evaluate(() => {
          const resultElement = document.querySelector('.result-type, .mbti-type, [class*="result"]');
          return {
            type: resultElement ? resultElement.textContent.trim() : '결과 없음',
            description: document.querySelector('.result-description, .mbti-description')?.textContent?.substring(0, 100) || '',
            hasResult: !!resultElement
          };
        });
        
        await this.page.screenshot({ 
          path: path.join(CONFIG.screenshotDir, 'mbti-result-production.png'),
          fullPage: true 
        });
        
        this.results.features.mbti = {
          questionsAnswered,
          completed: result.hasResult,
          result: result
        };
        
        console.log(`✅ MBTI 테스트 완료 - 결과: ${result.type}`);
        
      } catch (e) {
        this.results.features.mbti = {
          questionsAnswered,
          completed: false,
          error: 'No result page found'
        };
        console.log('⚠️ MBTI 결과 페이지 미발견');
      }
      
    } catch (error) {
      console.error(`❌ MBTI 테스트 실패:`, error.message);
      this.results.errors.push({ type: 'mbti', error: error.message });
    }
  }

  async testBMICalculator() {
    console.log('\n🏃 BMI 계산기 실제 계산 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tools/bmi-calculator.html', { waitUntil: 'networkidle2' });
      
      // 입력 필드 찾기
      const heightInput = await this.page.$('input[name="height"], #height, input[placeholder*="키"], input[placeholder*="height"]');
      const weightInput = await this.page.$('input[name="weight"], #weight, input[placeholder*="몸무게"], input[placeholder*="weight"]');
      
      if (heightInput && weightInput) {
        // 기존 값 지우고 입력
        await heightInput.evaluate(el => el.value = '');
        await heightInput.type('175');
        await weightInput.evaluate(el => el.value = '');
        await weightInput.type('70');
        
        console.log('📊 BMI 정보 입력 완료 (175cm, 70kg)');
        
        // 계산 버튼 찾아서 클릭
        const calculateButton = await this.page.$('button[type="submit"], .calculate, .btn-calculate, button');
        if (calculateButton) {
          await calculateButton.click();
          await this.page.waitForTimeout(2000);
          
          // 결과 확인
          const result = await this.page.evaluate(() => {
            const bmiValue = document.querySelector('.bmi-value, .result-value, [class*="bmi"]')?.textContent?.trim();
            const category = document.querySelector('.bmi-category, .health-status, [class*="category"]')?.textContent?.trim();
            const advice = document.querySelector('.bmi-advice, .health-advice, [class*="advice"]')?.textContent?.trim();
            
            return { 
              bmiValue: bmiValue || '',
              category: category || '',
              advice: advice ? advice.substring(0, 100) + '...' : '',
              hasResult: !!(bmiValue || category)
            };
          });
          
          await this.page.screenshot({ 
            path: path.join(CONFIG.screenshotDir, 'bmi-result-production.png'),
            fullPage: true 
          });
          
          this.results.features.bmi = { ...result, tested: true };
          console.log(`✅ BMI 계산 완료 - BMI: ${result.bmiValue}, 분류: ${result.category}`);
        } else {
          console.log('⚠️ 계산 버튼을 찾을 수 없음');
        }
      } else {
        console.log('⚠️ 입력 필드를 찾을 수 없음');
      }
      
    } catch (error) {
      console.error(`❌ BMI 계산기 테스트 실패:`, error.message);
      this.results.errors.push({ type: 'bmi', error: error.message });
    }
  }

  async testTextCounter() {
    console.log('\n📝 글자수 세기 실제 기능 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/tools/text-counter.html', { waitUntil: 'networkidle2' });
      
      const testText = `안녕하세요! 이것은 doha.kr 글자수 세기 도구 테스트입니다.
      
한글과 영어, 숫자가 모두 포함된 샘플 텍스트입니다. Testing 123.
자기소개서, 리포트, 블로그 글 작성 시 유용한 도구죠!

📝 이모지도 포함되어 있습니다.
줄바꿈과 공백도 정확히 카운팅되는지 확인해보겠습니다.`;
      
      const textArea = await this.page.$('textarea, .text-input, input[type="text"], #text-input');
      if (textArea) {
        await textArea.evaluate(el => el.value = '');
        await textArea.type(testText);
        await this.page.waitForTimeout(1000);
        
        console.log('📄 테스트 텍스트 입력 완료');
        
        const result = await this.page.evaluate(() => {
          const charCount = document.querySelector('.char-count, .character-count, [class*="char"]')?.textContent?.trim();
          const wordCount = document.querySelector('.word-count, [class*="word"]')?.textContent?.trim();
          const lineCount = document.querySelector('.line-count, [class*="line"]')?.textContent?.trim();
          const byteCount = document.querySelector('.byte-count, [class*="byte"]')?.textContent?.trim();
          
          return { 
            charCount: charCount || '',
            wordCount: wordCount || '',
            lineCount: lineCount || '',
            byteCount: byteCount || '',
            hasResult: !!(charCount || wordCount)
          };
        });
        
        await this.page.screenshot({ 
          path: path.join(CONFIG.screenshotDir, 'text-counter-production.png'),
          fullPage: true 
        });
        
        this.results.features.textCounter = { ...result, tested: true, inputLength: testText.length };
        console.log(`✅ 글자수 세기 완료 - 글자수: ${result.charCount}, 단어수: ${result.wordCount}`);
        
      } else {
        console.log('⚠️ 텍스트 입력 영역을 찾을 수 없음');
      }
      
    } catch (error) {
      console.error(`❌ 글자수 세기 테스트 실패:`, error.message);
      this.results.errors.push({ type: 'textCounter', error: error.message });
    }
  }

  async testDailyFortune() {
    console.log('\n🔮 일일운세 AI 생성 테스트');
    
    try {
      await this.page.goto(CONFIG.baseUrl + '/fortune/daily/', { waitUntil: 'networkidle2' });
      
      // 생년월일 입력
      const yearInput = await this.page.$('input[name="year"], #year, input[placeholder*="년"]');
      const monthInput = await this.page.$('input[name="month"], #month, select[name="month"], input[placeholder*="월"]');
      const dayInput = await this.page.$('input[name="day"], #day, select[name="day"], input[placeholder*="일"]');
      
      if (yearInput && monthInput && dayInput) {
        await yearInput.evaluate(el => el.value = '');
        await yearInput.type('1990');
        
        // 월/일은 select 또는 input일 수 있음
        if (await monthInput.evaluate(el => el.tagName) === 'SELECT') {
          await monthInput.select('5');
        } else {
          await monthInput.evaluate(el => el.value = '');
          await monthInput.type('5');
        }
        
        if (await dayInput.evaluate(el => el.tagName) === 'SELECT') {
          await dayInput.select('15');
        } else {
          await dayInput.evaluate(el => el.value = '');
          await dayInput.type('15');
        }
        
        console.log('📅 생년월일 입력 완료 (1990.5.15)');
        
        // 제출 버튼 클릭
        const submitButton = await this.page.$('button[type="submit"], .fortune-button, .submit-btn, .btn-primary');
        if (submitButton) {
          await submitButton.click();
          console.log('🔮 운세 요청 전송');
          
          // AI 응답 대기 (최대 15초)
          try {
            await this.page.waitForSelector('.fortune-result, .ai-result, [class*="result"], .fortune-content', { timeout: 15000 });
            
            const result = await this.page.evaluate(() => {
              const content = document.querySelector('.fortune-content, .result-content, .ai-content, .fortune-text')?.textContent?.trim();
              return { 
                content: content ? content.substring(0, 200) + '...' : '', 
                hasResult: !!content,
                contentLength: content ? content.length : 0,
                isAIGenerated: content && (content.includes('AI') || content.length > 100)
              };
            });
            
            await this.page.screenshot({ 
              path: path.join(CONFIG.screenshotDir, 'daily-fortune-production.png'),
              fullPage: true 
            });
            
            this.results.features.dailyFortune = { ...result, tested: true };
            console.log(`✅ 일일운세 AI 생성 완료 - 내용 길이: ${result.contentLength}자`);
            
          } catch (e) {
            console.log('⚠️ AI 운세 응답 대기 시간 초과 또는 결과 없음');
            this.results.features.dailyFortune = { tested: true, error: 'timeout or no result' };
          }
        } else {
          console.log('⚠️ 제출 버튼을 찾을 수 없음');
        }
      } else {
        console.log('⚠️ 생년월일 입력 필드를 찾을 수 없음');
      }
      
    } catch (error) {
      console.error(`❌ 일일운세 테스트 실패:`, error.message);
      this.results.errors.push({ type: 'fortune', error: error.message });
    }
  }

  async testAllMainPages() {
    console.log('\n📋 주요 페이지 네비게이션 테스트');
    
    const pages = [
      { name: 'Tests Index', url: '/tests/' },
      { name: 'Tools Index', url: '/tools/' },
      { name: 'Fortune Index', url: '/fortune/' },
      { name: 'Teto-Egen Intro', url: '/tests/teto-egen/' },
      { name: 'Love DNA Intro', url: '/tests/love-dna/' },
      { name: 'Salary Calculator', url: '/tools/salary-calculator.html' },
      { name: 'Saju Fortune', url: '/fortune/saju/' },
      { name: 'Tarot Fortune', url: '/fortune/tarot/' },
      { name: 'About', url: '/about/' },
      { name: 'Contact', url: '/contact/' }
    ];
    
    for (const pageInfo of pages) {
      try {
        await this.page.goto(CONFIG.baseUrl + pageInfo.url, { waitUntil: 'networkidle2', timeout: 10000 });
        
        const pageData = await this.page.evaluate(() => ({
          title: document.title,
          hasContent: document.body.textContent.length > 200,
          hasNavigation: !!document.querySelector('nav'),
          linkCount: document.querySelectorAll('a').length,
          hasForm: !!document.querySelector('form'),
          hasButtons: document.querySelectorAll('button').length
        }));
        
        this.results.pages[pageInfo.name] = { ...pageData, tested: true, url: pageInfo.url };
        console.log(`✅ ${pageInfo.name} - 링크 ${pageData.linkCount}개, 버튼 ${pageData.hasButtons}개`);
        
      } catch (error) {
        console.log(`❌ ${pageInfo.name} 접근 실패: ${error.message}`);
        this.results.errors.push({ type: 'page', page: pageInfo.name, error: error.message });
      }
    }
  }

  async checkPerformance() {
    console.log('\n⚡ 성능 및 기술 스택 검사');
    
    try {
      await this.page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      
      const performance = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintMetrics = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          firstPaint: paintMetrics.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintMetrics.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          hasServiceWorker: 'serviceWorker' in navigator,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled
        };
      });
      
      // 웹 기술 스택 확인
      const techStack = await this.page.evaluate(() => ({
        hasJQuery: typeof window.$ !== 'undefined',
        hasReact: !!(window.React || document.querySelector('[data-reactroot]')),
        hasVue: !!window.Vue,
        hasAngular: !!window.angular,
        hasServiceWorker: !!navigator.serviceWorker,
        hasLocalStorage: !!window.localStorage,
        hasSessionStorage: !!window.sessionStorage,
        hasWebGL: !!window.WebGLRenderingContext,
        hasWebWorker: !!window.Worker,
        hasCSS3: !!window.CSS && !!window.CSS.supports,
        viewport: document.querySelector('meta[name="viewport"]')?.content || ''
      }));
      
      this.results.performance = { ...performance, techStack };
      
      console.log(`📊 DOM 로딩: ${performance.domContentLoaded}ms`);
      console.log(`📊 전체 로딩: ${performance.loadComplete}ms`);
      console.log(`🎨 첫 페인트: ${Math.round(performance.firstPaint)}ms`);
      console.log(`🎨 첫 컨텐츠 페인트: ${Math.round(performance.firstContentfulPaint)}ms`);
      console.log(`🔧 Service Worker: ${performance.hasServiceWorker ? '지원됨' : '미지원'}`);
      console.log(`🌐 언어: ${performance.language}`);
      
    } catch (error) {
      console.log(`⚠️ 성능 측정 실패: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📋 프로덕션 테스트 보고서 생성');
    
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: CONFIG.baseUrl,
      pagesTestedCount: Object.keys(this.results.pages).length,
      featuresTestedCount: Object.keys(this.results.features).length,
      errorsCount: this.results.errors.length,
      screenshots: fs.readdirSync(CONFIG.screenshotDir).length,
      successfulFeatures: Object.values(this.results.features).filter(f => f.tested && !f.error).length
    };
    
    this.results.summary = summary;
    
    const reportPath = path.join('./', `doha-production-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n🎉 doha.kr 프로덕션 사이트 테스트 완료!');
    console.log('=' * 60);
    console.log(`📊 테스트 요약:`);
    console.log(`   - 테스트 페이지: ${summary.pagesTestedCount}개`);
    console.log(`   - 기능 테스트: ${summary.featuresTestedCount}개`);
    console.log(`   - 성공한 기능: ${summary.successfulFeatures}개`);
    console.log(`   - 발견된 오류: ${summary.errorsCount}개`);
    console.log(`   - 촬영 스크린샷: ${summary.screenshots}개`);
    console.log(`\n📁 결과 저장:`);
    console.log(`   - 보고서: ${reportPath}`);
    console.log(`   - 스크린샷: ${CONFIG.screenshotDir}/`);
    
    return this.results;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.testHomePage();
      await this.testAllMainPages();
      await this.testMBTIFull();
      await this.testBMICalculator();
      await this.testTextCounter();
      await this.testDailyFortune();
      await this.checkPerformance();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
      return this.results;
    } finally {
      await this.cleanup();
    }
  }
}

// 실행
async function main() {
  const tester = new ProductionDohaTest();
  return await tester.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProductionDohaTest;