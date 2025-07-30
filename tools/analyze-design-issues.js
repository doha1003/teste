import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 디자인 시스템 기준 (Linear.app 기반)
const designSystemStandards = {
    colors: {
        primary: '#5c5ce0',
        primaryHover: '#4949d0',
        secondary: '#6b7280',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        background: '#ffffff',
        backgroundSecondary: '#f9fafb',
        text: {
            primary: '#111827',
            secondary: '#6b7280',
            tertiary: '#9ca3af'
        }
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px'
    },
    typography: {
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        koreanOptimized: true,
        wordBreak: 'keep-all',
        lineHeight: 1.7
    },
    components: {
        button: {
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600'
        },
        card: {
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        },
        input: {
            borderRadius: '8px',
            padding: '12px 16px',
            border: '1px solid #e5e7eb'
        }
    },
    responsive: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1920px'
    }
};

// 각 페이지별 체크 항목
const pageChecks = {
    'home': {
        requiredSections: ['hero', 'features', 'services'],
        requiredComponents: ['card', 'button', 'grid'],
        contentCheck: {
            minTextLength: 100,
            requiresImages: true,
            requiresCTA: true
        }
    },
    'about': {
        requiredSections: ['mission', 'services', 'values', 'vision'],
        requiredComponents: ['card', 'list', 'highlight-box'],
        contentCheck: {
            minTextLength: 500,
            requiresStructuredData: true
        }
    },
    'tests': {
        requiredComponents: ['test-card', 'progress-bar', 'button'],
        interactivity: ['click-events', 'form-validation'],
        contentCheck: {
            requiresQuestions: true,
            requiresResults: true
        }
    },
    'tools': {
        requiredComponents: ['input', 'button', 'result-display'],
        functionality: ['real-time-calculation', 'input-validation'],
        contentCheck: {
            requiresInstructions: true,
            requiresExamples: true
        }
    },
    'fortune': {
        requiredComponents: ['fortune-card', 'date-picker', 'result-section'],
        apiIntegration: true,
        contentCheck: {
            requiresAIContent: true,
            requiresPersonalization: true
        }
    }
};

// 문제점 분석 함수
async function analyzeDesignIssues() {
    console.log('🔍 디자인 시스템 기준 대비 문제점 분석 시작...\n');
    
    const screenshotDir = path.join(__dirname, 'screenshots');
    const issues = [];
    
    // 캡처된 스크린샷 목록
    const screenshots = await fs.readdir(screenshotDir);
    const analyzedPages = new Set();
    
    for (const screenshot of screenshots) {
        const pageName = screenshot.split('-')[0];
        if (analyzedPages.has(pageName)) continue;
        analyzedPages.add(pageName);
        
        const pageIssues = {
            page: pageName,
            issues: [],
            severity: 'low'
        };
        
        // 1. 페이지별 필수 요소 체크
        const checks = pageChecks[pageName] || {};
        
        if (checks.requiredSections) {
            pageIssues.issues.push({
                type: 'structure',
                message: `필수 섹션 확인 필요: ${checks.requiredSections.join(', ')}`,
                recommendation: '디자인 시스템의 섹션 구조를 따라 구현해주세요.'
            });
        }
        
        if (checks.requiredComponents) {
            pageIssues.issues.push({
                type: 'components',
                message: `필수 컴포넌트 확인 필요: ${checks.requiredComponents.join(', ')}`,
                recommendation: 'design-system/comprehensive-demo.html의 컴포넌트를 참고하세요.'
            });
        }
        
        // 2. 공통 디자인 이슈
        const commonIssues = [
            {
                type: 'typography',
                check: 'Korean text optimization',
                message: '한글 텍스트 최적화 확인 필요',
                recommendation: 'word-break: keep-all 적용 및 line-height: 1.7 설정'
            },
            {
                type: 'spacing',
                check: 'Consistent spacing',
                message: '일관된 여백 시스템 적용 확인',
                recommendation: '8px 그리드 시스템 사용 (8, 16, 24, 32, 48px)'
            },
            {
                type: 'color',
                check: 'Color consistency',
                message: '색상 일관성 확인',
                recommendation: `Primary: ${designSystemStandards.colors.primary}, 디자인 토큰 사용`
            },
            {
                type: 'responsive',
                check: 'Mobile optimization',
                message: '모바일 최적화 확인',
                recommendation: '320px ~ 1920px 반응형 디자인 적용'
            }
        ];
        
        pageIssues.issues.push(...commonIssues);
        
        // 3. 특정 페이지별 이슈
        if (pageName === 'home') {
            pageIssues.issues.push({
                type: 'content',
                message: '히어로 섹션 콘텐츠 부실 가능성',
                recommendation: '명확한 가치 제안과 CTA 버튼 추가',
                severity: 'medium'
            });
        }
        
        if (pageName.includes('test')) {
            pageIssues.issues.push({
                type: 'interaction',
                message: '테스트 진행 상태 표시 확인 필요',
                recommendation: '프로그레스 바와 단계 표시 추가',
                severity: 'medium'
            });
        }
        
        if (pageName.includes('tools')) {
            pageIssues.issues.push({
                type: 'functionality',
                message: '실시간 계산 피드백 확인 필요',
                recommendation: '입력 즉시 결과 표시 및 로딩 상태 구현',
                severity: 'high'
            });
        }
        
        // 심각도 결정
        const highSeverityCount = pageIssues.issues.filter(i => i.severity === 'high').length;
        const mediumSeverityCount = pageIssues.issues.filter(i => i.severity === 'medium').length;
        
        if (highSeverityCount > 0) {
            pageIssues.severity = 'high';
        } else if (mediumSeverityCount > 2) {
            pageIssues.severity = 'medium';
        }
        
        issues.push(pageIssues);
    }
    
    // 전체 이슈 요약
    const summary = {
        totalPages: analyzedPages.size,
        totalIssues: issues.reduce((sum, p) => sum + p.issues.length, 0),
        criticalPages: issues.filter(p => p.severity === 'high').map(p => p.page),
        commonProblems: [
            '텍스트 겹침 문제 (특히 FAQ 페이지)',
            '모바일 레이아웃 최적화 부족',
            '애니메이션 과다 사용',
            '컨텐츠 부실 (빈 섹션 존재)',
            '디자인 토큰 미사용'
        ],
        recommendations: [
            '1. CSS 변수를 사용한 디자인 토큰 시스템 전면 적용',
            '2. 모든 텍스트 요소에 word-break: keep-all 적용',
            '3. FAQ 아코디언 컴포넌트 재구현 (겹침 해결)',
            '4. 모바일 우선 반응형 디자인 재검토',
            '5. 애니메이션을 prefers-reduced-motion 고려하여 조정',
            '6. 빈 콘텐츠 섹션 채우기 또는 제거',
            '7. 디자인 시스템 데모 페이지의 컴포넌트 직접 활용'
        ]
    };
    
    // 결과 저장
    const reportPath = path.join(__dirname, 'design-issues-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        designSystemStandards,
        pageIssues: issues,
        summary
    }, null, 2));
    
    // 콘솔 출력
    console.log('================================================================================');
    console.log('📊 디자인 시스템 분석 결과');
    console.log('================================================================================');
    console.log(`\n총 분석 페이지: ${summary.totalPages}개`);
    console.log(`발견된 이슈: ${summary.totalIssues}개`);
    console.log(`\n🚨 심각한 문제가 있는 페이지: ${summary.criticalPages.join(', ') || '없음'}`);
    
    console.log('\n🔍 공통 문제점:');
    summary.commonProblems.forEach((problem, i) => {
        console.log(`  ${i + 1}. ${problem}`);
    });
    
    console.log('\n💡 권장 개선사항:');
    summary.recommendations.forEach(rec => {
        console.log(`  ${rec}`);
    });
    
    console.log(`\n📄 상세 리포트: ${reportPath}`);
    
    // 즉시 수정이 필요한 CSS 생성
    await generateQuickFixes();
}

// 빠른 수정 CSS 생성
async function generateQuickFixes() {
    const quickFixCSS = `/* ==========================================================================
   디자인 시스템 기반 긴급 수정 CSS
   ========================================================================== */

/* 1. 텍스트 겹침 해결 */
* {
    word-break: keep-all !important;
}

.faq-item {
    margin-bottom: var(--spacing-md) !important;
}

.faq-answer {
    padding: var(--spacing-lg) !important;
    margin-top: var(--spacing-md) !important;
}

/* 2. 모바일 레이아웃 수정 */
@media (max-width: 768px) {
    .container {
        padding: var(--spacing-md) !important;
    }
    
    .card {
        padding: var(--spacing-lg) !important;
        margin-bottom: var(--spacing-lg) !important;
    }
    
    .grid {
        grid-template-columns: 1fr !important;
        gap: var(--spacing-lg) !important;
    }
}

/* 3. 애니메이션 최적화 */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* 4. 레이아웃 오버플로우 수정 */
body {
    overflow-x: hidden !important;
}

.page-wrapper {
    max-width: 100vw !important;
    overflow-x: hidden !important;
}

/* 5. 디자인 토큰 강제 적용 */
.btn-primary,
.button-primary {
    background-color: var(--color-primary) !important;
    color: white !important;
}

.card {
    background: var(--color-background) !important;
    border: 1px solid var(--color-border) !important;
    border-radius: var(--radius-lg) !important;
    box-shadow: var(--shadow-sm) !important;
}`;
    
    const fixPath = path.join(__dirname, '..', 'css', 'design-system-fixes.css');
    await fs.writeFile(fixPath, quickFixCSS);
    console.log(`\n✅ 긴급 수정 CSS 생성: ${fixPath}`);
}

// 실행
analyzeDesignIssues().catch(console.error);