/**
 * Live Site Test - doha.kr 실제 사이트 테스트
 */

const puppeteer = require('puppeteer');

class LiveSiteTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://doha.kr';
    this.results = {};
  }

  async init() {
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1366, height: 768 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // 한국어 설정 및 콘솔 로그 수집
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9'
    });

    // 콘솔 오류 수집
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ 콘솔 오류:', msg.text());
      }
    });

    this.page.on('pageerror', error => {
      console.log('❌ 페이지 오류:', error.message);
    });
  }

  async testMBTI() {
    console.log('\n🧠 실제 사이트 MBTI 테스트...');
    
    try {
      // 1. MBTI 소개 페이지 이동
      await this.page.goto(`${this.baseUrl}/tests/mbti/`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      console.log('✅ MBTI 소개 페이지 로드 성공');

      // 2. 시작 버튼 확인
      const startBtn = await this.page.$('.test-start-btn');
      if (startBtn) {
        console.log('✅ 시작 버튼 발견');
        
        // 3. 테스트 페이지로 이동
        await startBtn.click();
        await this.page.waitForTimeout(3000);
        
        // 현재 URL 확인
        const currentUrl = this.page.url();
        console.log('📍 현재 URL:', currentUrl);
        
        // 4. 테스트 화면 요소 확인
        const testScreen = await this.page.$('#test-screen');
        const questionOption = await this.page.$('.question-option');
        
        if (testScreen) {
          console.log('✅ 테스트 화면 발견');
        } else {
          console.log('❌ 테스트 화면 미발견');
        }
        
        if (questionOption) {
          console.log('✅ 질문 옵션 발견');
        } else {
          console.log('❌ 질문 옵션 미발견');
        }
        
        // 스크린샷
        await this.page.screenshot({ 
          path: `live-mbti-test-${Date.now()}.png`, 
          fullPage: true 
        });
        
      } else {
        console.log('❌ 시작 버튼 미발견');
      }
      
      return { status: 'completed', hasErrors: false };
      
    } catch (error) {
      console.log('❌ MBTI 테스트 오류:', error.message);
      return { status: 'failed', error: error.message };
    }
  }

  async testHomePage() {
    console.log('\n🏠 홈페이지 테스트...');
    
    try {
      await this.page.goto(this.baseUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      console.log('✅ 홈페이지 로드 성공');
      
      // 주요 요소들 체크
      const nav = await this.page.$('nav');
      const mainContent = await this.page.$('main');
      const footer = await this.page.$('footer');
      
      console.log('네비게이션:', nav ? '✅' : '❌');
      console.log('메인 콘텐츠:', mainContent ? '✅' : '❌');
      console.log('푸터:', footer ? '✅' : '❌');
      
      return { status: 'success' };
      
    } catch (error) {
      console.log('❌ 홈페이지 오류:', error.message);
      return { status: 'failed', error: error.message };
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    console.log('🌐 실제 사이트(doha.kr) 테스트 시작...\n');
    
    try {
      await this.init();
      
      // 홈페이지 먼저 테스트
      this.results.home = await this.testHomePage();
      
      // MBTI 테스트
      this.results.mbti = await this.testMBTI();
      
      console.log('\n📊 실제 사이트 테스트 결과:');
      console.log('================================');
      console.log('홈페이지:', this.results.home.status);
      console.log('MBTI 테스트:', this.results.mbti.status);
      
    } catch (error) {
      console.error('❌ 테스트 실행 오류:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 실행
if (require.main === module) {
  const tester = new LiveSiteTest();
  tester.run().catch(console.error);
}

module.exports = LiveSiteTest;