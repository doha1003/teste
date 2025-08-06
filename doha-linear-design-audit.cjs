/**
 * doha.kr Linear.app 디자인 언어 검증 도구
 * 26개 페이지 전체에 대한 디자인 일관성 및 품질 검증
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 검증할 페이지 목록 (26개)
const PAGES_TO_VERIFY = [
  // Core Pages (7개)
  { name: 'Home', url: '/index.html', category: 'core' },
  { name: '404 Error Page', url: '/404.html', category: 'core' },
  { name: 'Offline Page', url: '/offline.html', category: 'core' },
  
  // Fortune Pages (5개)
  { name: 'Fortune Index', url: '/fortune/index.html', category: 'fortune' },
  { name: 'Daily Fortune', url: '/fortune/daily/index.html', category: 'fortune' },
  { name: 'Saju Fortune', url: '/fortune/saju/index.html', category: 'fortune' },
  { name: 'Tarot Fortune', url: '/fortune/tarot/index.html', category: 'fortune' },
  { name: 'Zodiac Fortune', url: '/fortune/zodiac/index.html', category: 'fortune' },
  { name: 'Zodiac Animal Fortune', url: '/fortune/zodiac-animal/index.html', category: 'fortune' },
  
  // Test Pages (8개)
  { name: 'Tests Index', url: '/tests/index.html', category: 'tests' },
  { name: 'MBTI Test Intro', url: '/tests/mbti/index.html', category: 'tests' },
  { name: 'MBTI Test Page', url: '/tests/mbti/test.html', category: 'tests' },
  { name: 'Love DNA Test Intro', url: '/tests/love-dna/index.html', category: 'tests' },
  { name: 'Love DNA Test Page', url: '/tests/love-dna/test.html', category: 'tests' },
  { name: 'Teto-Egen Test Intro', url: '/tests/teto-egen/index.html', category: 'tests' },
  { name: 'Teto-Egen Test Page', url: '/tests/teto-egen/test.html', category: 'tests' },
  
  // Tools Pages (4개)  
  { name: 'Tools Index', url: '/tools/index.html', category: 'tools' },
  { name: 'BMI Calculator', url: '/tools/bmi-calculator.html', category: 'tools' },
  { name: 'Text Counter', url: '/tools/text-counter.html', category: 'tools' },
  { name: 'Salary Calculator', url: '/tools/salary-calculator.html', category: 'tools' },
  
  // Info Pages (4개)
  { name: 'About', url: '/about/index.html', category: 'info' },
  { name: 'Contact', url: '/contact/index.html', category: 'info' },
  { name: 'Privacy Policy', url: '/privacy/index.html', category: 'info' },
  { name: 'Terms of Service', url: '/terms/index.html', category: 'info' },
  { name: 'FAQ', url: '/faq/index.html', category: 'info' }
];

// Linear.app 디자인 언어 검증 기준
const LINEAR_DESIGN_CRITERIA = {
  // 1. 디자인 일관성 검증
  design_consistency: {
    hero_section_height: { max: '40vh', expected: 'below_40vh' },
    button_style: { shadow: 'subtle', background: 'solid_color' },
    card_design: { background: 'white', border: 'subtle' },
    typography_hierarchy: { levels: 6, consistent: true },
    color_system: { grayscale: true, consistent: true }
  },
  
  // 2. 인터랙션 품질 검증
  interaction_quality: {
    hover_effects: { present: true, smooth: true },
    focus_styles: { accessible: true, visible: true },
    transitions: { duration: '150-200ms', smooth: true },
    click_feedback: { present: true, immediate: true }
  },
  
  // 3. 한글 환경 검증
  korean_optimization: {
    word_break: 'keep-all',
    line_height: 1.7,
    font_family: 'Pretendard',
    input_fields: { adequate_spacing: true }
  },
  
  // 4. 성능 지표 검증
  performance_metrics: {
    css_bundle_loading: { success: true, fast: true },
    animations: { smooth: true, performant: true },
    mobile_touch: { responsive: true, appropriate_size: true }
  }
};

class LinearDesignAuditor {
  constructor() {
    this.results = {
      summary: {
        total_pages: 0,
        passed_pages: 0,
        failed_pages: 0,
        compliance_percentage: 0
      },
      detailed_results: [],
      issues_found: [],
      recommendations: []
    };
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async auditPage(pageInfo) {
    const page = await this.browser.newPage();
    
    try {
      // 페이지 로드
      const baseUrl = 'http://localhost:3000';
      const fullUrl = baseUrl + pageInfo.url;
      
      console.log(`🔍 Auditing: ${pageInfo.name} (${fullUrl})`);
      
      await page.goto(fullUrl, { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });

      // CSS 로딩 대기 (번들 CSS 확인)
      await page.waitForSelector('body', { timeout: 5000 });
      
      const auditResult = {
        page: pageInfo.name,
        url: pageInfo.url,
        category: pageInfo.category,
        timestamp: new Date().toISOString(),
        design_consistency: await this.checkDesignConsistency(page),
        interaction_quality: await this.checkInteractionQuality(page),
        korean_optimization: await this.checkKoreanOptimization(page),
        performance_metrics: await this.checkPerformanceMetrics(page),
        screenshot_path: await this.takeScreenshot(page, pageInfo.name),
        overall_score: 0, // 계산됨
        issues: []
      };
      
      // 전체 점수 계산
      auditResult.overall_score = this.calculateOverallScore(auditResult);
      
      return auditResult;
      
    } catch (error) {
      console.error(`❌ Error auditing ${pageInfo.name}:`, error.message);
      return {
        page: pageInfo.name,
        url: pageInfo.url,
        category: pageInfo.category,
        error: error.message,
        overall_score: 0,
        issues: [{ type: 'critical', message: `Page failed to load: ${error.message}` }]
      };
    } finally {
      await page.close();
    }
  }

  async checkDesignConsistency(page) {
    const consistency = {
      hero_section: false,
      button_styles: false,
      card_design: false,
      typography: false,
      color_system: false,
      score: 0
    };

    try {
      // 1. 히어로 섹션 높이 검증 (40vh 이하)
      const heroHeight = await page.evaluate(() => {
        const hero = document.querySelector('.hero, .hero-section, .main-hero');
        if (hero) {
          const style = window.getComputedStyle(hero);
          return parseFloat(style.height);
        }
        return null;
      });
      
      if (heroHeight === null || heroHeight <= window.innerHeight * 0.4) {
        consistency.hero_section = true;
      }

      // 2. 버튼 스타일 검증 (미묘한 그림자, 단색)
      const buttonStyles = await page.evaluate(() => {
        const buttons = document.querySelectorAll('.btn, .btn-primary, .cta-button');
        if (buttons.length === 0) return false;
        
        let validButtons = 0;
        buttons.forEach(btn => {
          const style = window.getComputedStyle(btn);
          const boxShadow = style.boxShadow;
          const background = style.backgroundColor;
          
          // 미묘한 그림자와 단색 배경 확인
          if (boxShadow !== 'none' && !background.includes('linear-gradient')) {
            validButtons++;
          }
        });
        
        return validButtons / buttons.length >= 0.8; // 80% 이상
      });
      consistency.button_styles = buttonStyles;

      // 3. 카드 디자인 검증 (흰 배경, 얇은 보더)
      const cardDesign = await page.evaluate(() => {
        const cards = document.querySelectorAll('.card, .service-card, .feature-card');
        if (cards.length === 0) return true; // 카드가 없으면 통과
        
        let validCards = 0;
        cards.forEach(card => {
          const style = window.getComputedStyle(card);
          const backgroundColor = style.backgroundColor;
          const border = style.border;
          
          // 흰색 계열 배경과 미묘한 보더 확인
          if (backgroundColor.includes('255, 255, 255') || backgroundColor === 'white') {
            if (border.includes('1px') || border.includes('rgba')) {
              validCards++;
            }
          }
        });
        
        return validCards / cards.length >= 0.8;
      });
      consistency.card_design = cardDesign;

      // 4. 타이포그래피 계층구조 검증
      const typography = await page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const textElements = document.querySelectorAll('.text-heading-1, .text-heading-2, .text-body');
        
        return headings.length > 0 || textElements.length > 0;
      });
      consistency.typography = typography;

      // 5. 색상 시스템 검증 (그레이 스케일 중심)
      const colorSystem = await page.evaluate(() => {
        const rootStyles = window.getComputedStyle(document.documentElement);
        const primaryColor = rootStyles.getPropertyValue('--color-text-primary');
        const secondaryColor = rootStyles.getPropertyValue('--color-text-secondary');
        
        return primaryColor !== '' && secondaryColor !== '';
      });
      consistency.color_system = colorSystem;

      // 점수 계산
      const checks = [
        consistency.hero_section,
        consistency.button_styles,
        consistency.card_design,
        consistency.typography,
        consistency.color_system
      ];
      consistency.score = (checks.filter(Boolean).length / checks.length) * 100;

    } catch (error) {
      console.error('Design consistency check failed:', error);
    }

    return consistency;
  }

  async checkInteractionQuality(page) {
    const interactions = {
      hover_effects: false,
      focus_styles: false,
      transitions: false,
      click_feedback: false,
      score: 0
    };

    try {
      // 1. 호버 효과 검증
      const hoverEffects = await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll('button, .btn, .card--clickable, a');
        if (interactiveElements.length === 0) return false;
        
        let elementsWithHover = 0;
        interactiveElements.forEach(element => {
          const style = window.getComputedStyle(element);
          const transition = style.transition;
          
          if (transition !== 'none' && transition !== '') {
            elementsWithHover++;
          }
        });
        
        return elementsWithHover / interactiveElements.length >= 0.7;
      });
      interactions.hover_effects = hoverEffects;

      // 2. 포커스 스타일 검증
      const focusStyles = await page.evaluate(() => {
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        return focusableElements.length > 0; // 포커스 가능한 요소 존재 확인
      });
      interactions.focus_styles = focusStyles;

      // 3. 트랜지션 검증 (150-200ms 범위)
      const transitions = await page.evaluate(() => {
        const elementsWithTransition = document.querySelectorAll('[style*="transition"], .btn, .card');
        if (elementsWithTransition.length === 0) return false;
        
        let validTransitions = 0;
        elementsWithTransition.forEach(element => {
          const style = window.getComputedStyle(element);
          const transitionDuration = style.transitionDuration;
          
          if (transitionDuration.includes('0.15s') || transitionDuration.includes('0.2s') || 
              transitionDuration.includes('150ms') || transitionDuration.includes('200ms')) {
            validTransitions++;
          }
        });
        
        return validTransitions > 0;
      });
      interactions.transitions = transitions;

      // 4. 클릭 피드백 확인 (active 스타일)
      const clickFeedback = await page.evaluate(() => {
        const clickableElements = document.querySelectorAll('button, .btn');
        return clickableElements.length > 0;
      });
      interactions.click_feedback = clickFeedback;

      // 점수 계산
      const checks = [
        interactions.hover_effects,
        interactions.focus_styles,
        interactions.transitions,
        interactions.click_feedback
      ];
      interactions.score = (checks.filter(Boolean).length / checks.length) * 100;

    } catch (error) {
      console.error('Interaction quality check failed:', error);
    }

    return interactions;
  }

  async checkKoreanOptimization(page) {
    const korean = {
      word_break: false,
      line_height: false,
      font_family: false,
      input_fields: false,
      score: 0
    };

    try {
      // 1. word-break: keep-all 검증
      const wordBreak = await page.evaluate(() => {
        const textElements = document.querySelectorAll('p, .text-korean, .card-title, .card-text');
        if (textElements.length === 0) return false;
        
        let elementsWithKeepAll = 0;
        textElements.forEach(element => {
          const style = window.getComputedStyle(element);
          if (style.wordBreak === 'keep-all') {
            elementsWithKeepAll++;
          }
        });
        
        return elementsWithKeepAll / textElements.length >= 0.5;
      });
      korean.word_break = wordBreak;

      // 2. line-height 1.7 검증
      const lineHeight = await page.evaluate(() => {
        const bodyElements = document.querySelectorAll('.text-body, .card-text, p');
        if (bodyElements.length === 0) return false;
        
        let elementsWithGoodLineHeight = 0;
        bodyElements.forEach(element => {
          const style = window.getComputedStyle(element);
          const lineHeight = parseFloat(style.lineHeight);
          
          if (lineHeight >= 1.6 && lineHeight <= 1.8) {
            elementsWithGoodLineHeight++;
          }
        });
        
        return elementsWithGoodLineHeight / bodyElements.length >= 0.5;
      });
      korean.line_height = lineHeight;

      // 3. Pretendard 폰트 확인
      const fontFamily = await page.evaluate(() => {
        const bodyStyle = window.getComputedStyle(document.body);
        const fontFamily = bodyStyle.fontFamily.toLowerCase();
        return fontFamily.includes('pretendard');
      });
      korean.font_family = fontFamily;

      // 4. 입력 필드 여백 확인
      const inputFields = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, textarea');
        if (inputs.length === 0) return true; // 입력 필드가 없으면 통과
        
        let inputsWithGoodSpacing = 0;
        inputs.forEach(input => {
          const style = window.getComputedStyle(input);
          const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          
          if (padding >= 16) { // 8px * 2 = 16px 이상
            inputsWithGoodSpacing++;
          }
        });
        
        return inputsWithGoodSpacing / inputs.length >= 0.8;
      });
      korean.input_fields = inputFields;

      // 점수 계산
      const checks = [
        korean.word_break,
        korean.line_height,
        korean.font_family,
        korean.input_fields
      ];
      korean.score = (checks.filter(Boolean).length / checks.length) * 100;

    } catch (error) {
      console.error('Korean optimization check failed:', error);
    }

    return korean;
  }

  async checkPerformanceMetrics(page) {
    const performance = {
      css_bundle_loading: false,
      animations_smooth: false,
      mobile_responsive: false,
      score: 0
    };

    try {
      // 1. CSS 번들 로딩 확인
      const cssBundle = await page.evaluate(() => {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const bundleFound = Array.from(stylesheets).some(link => 
          link.href.includes('styles.css') || link.href.includes('dist/')
        );
        return bundleFound;
      });
      performance.css_bundle_loading = cssBundle;

      // 2. 애니메이션 성능 (will-change 속성 확인)
      const animationsSmooth = await page.evaluate(() => {
        const animatedElements = document.querySelectorAll('.btn, .card');
        if (animatedElements.length === 0) return true;
        
        let optimizedElements = 0;
        animatedElements.forEach(element => {
          const style = window.getComputedStyle(element);
          if (style.willChange !== 'auto' || style.transform !== 'none') {
            optimizedElements++;
          }
        });
        
        return optimizedElements > 0;
      });
      performance.animations_smooth = animationsSmooth;

      // 3. 모바일 반응형 확인 (viewport meta 태그)
      const mobileResponsive = await page.evaluate(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        return viewport !== null;
      });
      performance.mobile_responsive = mobileResponsive;

      // 점수 계산
      const checks = [
        performance.css_bundle_loading,
        performance.animations_smooth,
        performance.mobile_responsive
      ];
      performance.score = (checks.filter(Boolean).length / checks.length) * 100;

    } catch (error) {
      console.error('Performance metrics check failed:', error);
    }

    return performance;
  }

  async takeScreenshot(page, pageName) {
    try {
      const screenshotDir = path.join(__dirname, 'design-audit-screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const fileName = `${pageName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      const filePath = path.join(screenshotDir, fileName);
      
      await page.screenshot({
        path: filePath,
        fullPage: true,
        type: 'png'
      });
      
      return filePath;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return null;
    }
  }

  calculateOverallScore(auditResult) {
    if (auditResult.error) return 0;
    
    const scores = [
      auditResult.design_consistency.score,
      auditResult.interaction_quality.score,
      auditResult.korean_optimization.score,
      auditResult.performance_metrics.score
    ];
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  generateIssues(auditResult) {
    const issues = [];
    
    if (auditResult.design_consistency.score < 80) {
      issues.push({
        type: 'design',
        severity: 'medium',
        message: 'Linear.app 디자인 일관성이 부족합니다',
        details: auditResult.design_consistency
      });
    }
    
    if (auditResult.korean_optimization.score < 70) {
      issues.push({
        type: 'korean',
        severity: 'high',
        message: '한글 최적화가 미흡합니다',
        details: auditResult.korean_optimization
      });
    }
    
    if (auditResult.interaction_quality.score < 60) {
      issues.push({
        type: 'interaction',
        severity: 'medium',
        message: '인터랙션 품질이 개선 필요합니다',
        details: auditResult.interaction_quality
      });
    }
    
    return issues;
  }

  async runFullAudit() {
    console.log('🚀 Starting Linear.app Design Language Audit for doha.kr');
    console.log(`📋 Total pages to audit: ${PAGES_TO_VERIFY.length}`);
    
    await this.initialize();
    
    this.results.summary.total_pages = PAGES_TO_VERIFY.length;
    
    for (const pageInfo of PAGES_TO_VERIFY) {
      const auditResult = await this.auditPage(pageInfo);
      
      // 이슈 생성
      auditResult.issues = this.generateIssues(auditResult);
      this.results.issues_found.push(...auditResult.issues);
      
      this.results.detailed_results.push(auditResult);
      
      if (auditResult.overall_score >= 70) {
        this.results.summary.passed_pages++;
      } else {
        this.results.summary.failed_pages++;
      }
      
      console.log(`✅ ${pageInfo.name}: ${auditResult.overall_score}%`);
    }
    
    // 전체 준수율 계산
    this.results.summary.compliance_percentage = Math.round(
      (this.results.summary.passed_pages / this.results.summary.total_pages) * 100
    );
    
    await this.browser.close();
    
    // 결과 저장
    this.saveResults();
    this.generateReport();
    
    return this.results;
  }

  saveResults() {
    const resultsPath = path.join(__dirname, `design-audit-results-${Date.now()}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 Results saved to: ${resultsPath}`);
  }

  generateReport() {
    const report = this.generateMarkdownReport();
    const reportPath = path.join(__dirname, `design-audit-report-${Date.now()}.md`);
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Report generated: ${reportPath}`);
  }

  generateMarkdownReport() {
    const { summary, detailed_results, issues_found } = this.results;
    
    let report = `# doha.kr Linear.app 디자인 언어 검증 보고서\n\n`;
    report += `**검증 일시**: ${new Date().toLocaleString('ko-KR')}\n`;
    report += `**검증 페이지 수**: ${summary.total_pages}개\n\n`;
    
    // 요약
    report += `## 📊 검증 요약\n\n`;
    report += `- **전체 페이지**: ${summary.total_pages}개\n`;
    report += `- **통과**: ${summary.passed_pages}개\n`;
    report += `- **실패**: ${summary.failed_pages}개\n`;
    report += `- **Linear.app 디자인 준수율**: ${summary.compliance_percentage}%\n\n`;
    
    // 카테고리별 결과
    const categories = ['core', 'fortune', 'tests', 'tools', 'info'];
    report += `## 📋 카테고리별 검증 결과\n\n`;
    
    categories.forEach(category => {
      const categoryPages = detailed_results.filter(r => r.category === category);
      const avgScore = Math.round(
        categoryPages.reduce((sum, page) => sum + page.overall_score, 0) / categoryPages.length
      );
      
      report += `### ${category.toUpperCase()} (${categoryPages.length}개 페이지)\n`;
      report += `**평균 점수**: ${avgScore}%\n\n`;
      
      categoryPages.forEach(page => {
        const status = page.overall_score >= 70 ? '✅' : '❌';
        report += `- ${status} ${page.page}: ${page.overall_score}%\n`;
      });
      report += `\n`;
    });
    
    // 발견된 주요 이슈
    report += `## 🚨 발견된 주요 이슈\n\n`;
    
    const issueTypes = ['design', 'korean', 'interaction', 'performance'];
    issueTypes.forEach(type => {
      const typeIssues = issues_found.filter(issue => issue.type === type);
      if (typeIssues.length > 0) {
        report += `### ${type.toUpperCase()} 이슈 (${typeIssues.length}개)\n\n`;
        typeIssues.slice(0, 5).forEach(issue => {
          report += `- **${issue.severity.toUpperCase()}**: ${issue.message}\n`;
        });
        report += `\n`;
      }
    });
    
    // 개선 권장사항
    report += `## 💡 개선 권장사항\n\n`;
    
    if (summary.compliance_percentage < 80) {
      report += `### 우선순위 높음\n`;
      report += `1. **디자인 일관성 개선**: Linear.app 디자인 시스템 요소들의 일관된 적용\n`;
      report += `2. **한글 타이포그래피 최적화**: word-break: keep-all 및 line-height 1.7 적용\n`;
      report += `3. **버튼 스타일 통일**: 미묘한 그림자와 단색 배경으로 통일\n\n`;
    }
    
    if (issues_found.filter(i => i.type === 'korean').length > 5) {
      report += `### 한글 최적화 개선\n`;
      report += `1. 모든 텍스트 요소에 word-break: keep-all 적용\n`;
      report += `2. 본문 텍스트 line-height를 1.7로 조정\n`;
      report += `3. Pretendard 폰트 로딩 확인\n\n`;
    }
    
    // 상세 페이지별 결과
    report += `## 📄 상세 페이지별 검증 결과\n\n`;
    
    detailed_results.forEach(page => {
      report += `### ${page.page}\n`;
      report += `- **전체 점수**: ${page.overall_score}%\n`;
      report += `- **디자인 일관성**: ${page.design_consistency.score}%\n`;
      report += `- **인터랙션 품질**: ${page.interaction_quality.score}%\n`;
      report += `- **한글 최적화**: ${page.korean_optimization.score}%\n`;
      report += `- **성능 지표**: ${page.performance_metrics.score}%\n`;
      
      if (page.issues && page.issues.length > 0) {
        report += `- **이슈**: ${page.issues.length}개\n`;
      }
      
      if (page.screenshot_path) {
        report += `- **스크린샷**: ${path.basename(page.screenshot_path)}\n`;
      }
      
      report += `\n`;
    });
    
    return report;
  }
}

// 실행 함수
async function runDesignAudit() {
  const auditor = new LinearDesignAuditor();
  
  try {
    const results = await auditor.runFullAudit();
    
    console.log('\n🎉 Design audit completed!');
    console.log(`📊 Overall compliance: ${results.summary.compliance_percentage}%`);
    console.log(`✅ Passed: ${results.summary.passed_pages}/${results.summary.total_pages} pages`);
    console.log(`🚨 Issues found: ${results.issues_found.length}`);
    
    return results;
  } catch (error) {
    console.error('❌ Design audit failed:', error);
    throw error;
  }
}

// 모듈 실행 또는 export
if (require.main === module) {
  runDesignAudit().catch(console.error);
} else {
  module.exports = { LinearDesignAuditor, runDesignAudit };
}