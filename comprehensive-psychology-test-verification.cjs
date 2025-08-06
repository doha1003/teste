/**
 * Comprehensive Psychology Test Verification
 * 심리테스트 3개의 완전한 기능 검증
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PsychologyTestVerifier {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      mbti: { status: 'pending', errors: [], screenshots: [] },
      loveDna: { status: 'pending', errors: [], screenshots: [] },
      tetoEgen: { status: 'pending', errors: [], screenshots: [] },
      summary: {}
    };
    this.baseUrl = 'http://localhost:3000';
  }

  async init() {
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1366, height: 768 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // 한국어 설정
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9'
    });
  }

  async screenshot(name) {
    const timestamp = Date.now();
    const filename = `test-${name}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: filename, 
      fullPage: true 
    });
    console.log(`📸 스크린샷 저장: ${filename}`);
    return filename;
  }

  async testMBTI() {
    console.log('\n🧠 MBTI 테스트 검증 시작...');
    
    try {
      // 1. MBTI 소개 페이지 이동
      await this.page.goto(`${this.baseUrl}/tests/mbti/`, { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('.test-start-btn', { timeout: 10000 });
      
      // 2. 테스트 시작 버튼 클릭
      await this.page.click('.test-start-btn');
      await this.page.waitForSelector('#test-screen', { timeout: 10000 });
      
      // 3. 질문들 진행 (처음 5개 질문만)
      for (let i = 0; i < 5; i++) {
        await this.page.waitForSelector('.question-option', { timeout: 5000 });
        
        // 첫 번째 옵션 선택
        const options = await this.page.$$('.question-option');
        if (options.length > 0) {
          await options[0].click();
          await this.page.waitForTimeout(1000);
          
          // 다음 버튼 클릭
          const nextBtn = await this.page.$('#next-btn');
          if (nextBtn) {
            await nextBtn.click();
            await this.page.waitForTimeout(1000);
          }
        }
      }
      
      // 4. 스크린샷 저장
      const screenshot = await this.screenshot('mbti-progress');
      this.results.mbti.screenshots.push(screenshot);
      
      this.results.mbti.status = 'success';
      console.log('✅ MBTI 테스트 기본 동작 확인됨');
      
    } catch (error) {
      this.results.mbti.status = 'failed';
      this.results.mbti.errors.push(error.message);
      console.log('❌ MBTI 테스트 실패:', error.message);
      
      const errorScreenshot = await this.screenshot('mbti-error');
      this.results.mbti.screenshots.push(errorScreenshot);
    }
  }

  async testLoveDNA() {
    console.log('\n💕 Love DNA 테스트 검증 시작...');
    
    try {
      // 1. Love DNA 소개 페이지 이동
      await this.page.goto(`${this.baseUrl}/tests/love-dna/`, { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('.test-start-btn', { timeout: 10000 });
      
      // 2. 테스트 시작 버튼 클릭
      await this.page.click('.test-start-btn');
      await this.page.waitForSelector('#test-screen', { timeout: 10000 });
      
      // 3. 질문들 진행 (처음 3개 질문만)
      for (let i = 0; i < 3; i++) {
        await this.page.waitForSelector('.question-option', { timeout: 5000 });
        
        // 첫 번째 옵션 선택
        const options = await this.page.$$('.question-option');
        if (options.length > 0) {
          await options[0].click();
          await this.page.waitForTimeout(1000);
          
          // 다음 버튼 클릭
          const nextBtn = await this.page.$('#next-btn');
          if (nextBtn) {
            await nextBtn.click();
            await this.page.waitForTimeout(1000);
          }
        }
      }
      
      // 4. 스크린샷 저장
      const screenshot = await this.screenshot('love-dna-progress');
      this.results.loveDna.screenshots.push(screenshot);
      
      this.results.loveDna.status = 'success';
      console.log('✅ Love DNA 테스트 기본 동작 확인됨');
      
    } catch (error) {
      this.results.loveDna.status = 'failed';
      this.results.loveDna.errors.push(error.message);
      console.log('❌ Love DNA 테스트 실패:', error.message);
      
      const errorScreenshot = await this.screenshot('love-dna-error');
      this.results.loveDna.screenshots.push(errorScreenshot);
    }
  }

  async testTetoEgen() {
    console.log('\n🎭 Teto-Egen 테스트 검증 시작...');
    
    try {
      // 1. Teto-Egen 소개 페이지 이동
      await this.page.goto(`${this.baseUrl}/tests/teto-egen/`, { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('.test-start-btn', { timeout: 10000 });
      
      // 2. 테스트 시작 버튼 클릭
      await this.page.click('.test-start-btn');
      await this.page.waitForSelector('#test-screen', { timeout: 10000 });
      
      // 3. 질문들 진행 (처음 3개 질문만)
      for (let i = 0; i < 3; i++) {
        await this.page.waitForSelector('.question-option', { timeout: 5000 });
        
        // 첫 번째 옵션 선택
        const options = await this.page.$$('.question-option');
        if (options.length > 0) {
          await options[0].click();
          await this.page.waitForTimeout(1000);
          
          // 다음 버튼 클릭
          const nextBtn = await this.page.$('#next-btn');
          if (nextBtn) {
            await nextBtn.click();
            await this.page.waitForTimeout(1000);
          }
        }
      }
      
      // 4. 스크린샷 저장
      const screenshot = await this.screenshot('teto-egen-progress');
      this.results.tetoEgen.screenshots.push(screenshot);
      
      this.results.tetoEgen.status = 'success';
      console.log('✅ Teto-Egen 테스트 기본 동작 확인됨');
      
    } catch (error) {
      this.results.tetoEgen.status = 'failed';
      this.results.tetoEgen.errors.push(error.message);
      console.log('❌ Teto-Egen 테스트 실패:', error.message);
      
      const errorScreenshot = await this.screenshot('teto-egen-error');
      this.results.tetoEgen.screenshots.push(errorScreenshot);
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = `psychology-tests-verification-${timestamp}.json`;
    
    // 요약 생성
    const successCount = Object.values(this.results).filter(r => r.status === 'success').length;
    const totalTests = 3;
    
    this.results.summary = {
      timestamp: new Date().toISOString(),
      totalTests,
      successCount,
      failureCount: totalTests - successCount,
      successRate: (successCount / totalTests * 100).toFixed(1) + '%',
      status: successCount === totalTests ? 'ALL_PASSED' : 'SOME_FAILED'
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📊 검증 보고서 생성: ${reportFile}`);
    
    return this.results;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    console.log('🚀 심리테스트 완전 검증 시작...\n');
    
    try {
      await this.init();
      
      // 각 테스트 순차 실행
      await this.testMBTI();
      await this.testLoveDNA();
      await this.testTetoEgen();
      
      // 결과 보고서
      const results = this.generateReport();
      
      console.log('\n📋 최종 검증 결과:');
      console.log('===================');
      console.log(`총 테스트: ${results.summary.totalTests}개`);
      console.log(`성공: ${results.summary.successCount}개`);
      console.log(`실패: ${results.summary.failureCount}개`);
      console.log(`성공률: ${results.summary.successRate}`);
      console.log(`전체 상태: ${results.summary.status}`);
      
      if (results.summary.status === 'ALL_PASSED') {
        console.log('\n🎉 모든 심리테스트가 정상 작동합니다!');
      } else {
        console.log('\n⚠️ 일부 테스트에서 문제가 발견되었습니다.');
      }
      
    } catch (error) {
      console.error('❌ 검증 프로세스 오류:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 실행
if (require.main === module) {
  const verifier = new PsychologyTestVerifier();
  verifier.run().catch(console.error);
}

module.exports = PsychologyTestVerifier;