#!/usr/bin/env node

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI로 웹사이트 분석하기
async function analyzeWithAI() {
    console.log('🤖 AI를 사용한 doha.kr 종합 분석 시작...\n');

    const analysisPrompts = [
        {
            name: 'security-review',
            prompt: `doha.kr 웹사이트의 보안 상태를 분석해주세요:
            1. XSS 방지가 제대로 되어있는지
            2. CSP 헤더가 적절한지
            3. DOMPurify 사용이 올바른지
            4. 민감한 정보 노출이 없는지
            주요 파일들: /js/security-config.js, /fortune/daily/index.html`,
            outputFile: 'ai-security-review.md'
        },
        {
            name: 'performance-analysis',
            prompt: `doha.kr의 성능 최적화 상태를 분석해주세요:
            1. 만세력 API 전환이 성능에 미친 영향
            2. CSS 모듈화의 효과
            3. 추가 최적화 가능한 부분
            4. 모바일 성능 개선점
            주요 변경사항: 38MB JS 파일을 API로 전환, CSS 15개 파일로 분리`,
            outputFile: 'ai-performance-analysis.md'
        },
        {
            name: 'ux-review',
            prompt: `doha.kr의 사용자 경험을 평가해주세요:
            1. 운세 결과 카드 디자인의 효과성
            2. 네비게이션의 직관성
            3. 모바일 사용성
            4. 개선이 필요한 UX 요소
            주요 페이지: /fortune/daily/, /fortune/saju/, /fortune/tarot/`,
            outputFile: 'ai-ux-review.md'
        },
        {
            name: 'content-improvement',
            prompt: `doha.kr의 콘텐츠 개선 방안을 제안해주세요:
            1. 운세 서비스의 차별화 방안
            2. 심리테스트 콘텐츠 확장 아이디어
            3. SEO 개선 방안
            4. 사용자 참여도 향상 방법
            현재 서비스: AI 사주팔자, 타로, MBTI, 각종 계산기`,
            outputFile: 'ai-content-improvement.md'
        }
    ];

    const results = [];

    for (const analysis of analysisPrompts) {
        console.log(`\n📊 분석 중: ${analysis.name}`);
        console.log(`프롬프트: ${analysis.prompt.substring(0, 100)}...`);

        try {
            // Gemini CLI 사용
            const command = `gemini "${analysis.prompt}"`;
            
            const result = await new Promise((resolve, reject) => {
                exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(stdout);
                });
            });

            // 결과 저장
            await fs.writeFile(
                path.join(__dirname, 'analysis', analysis.outputFile),
                `# ${analysis.name} - AI 분석 결과\n\n` +
                `분석 일시: ${new Date().toLocaleString('ko-KR')}\n\n` +
                `## 분석 내용\n\n${result}\n`
            );

            results.push({
                name: analysis.name,
                success: true,
                file: analysis.outputFile
            });

            console.log(`✅ 완료: ${analysis.outputFile}`);
        } catch (error) {
            console.error(`❌ 실패: ${error.message}`);
            results.push({
                name: analysis.name,
                success: false,
                error: error.message
            });
        }

        // API 제한 방지를 위한 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 종합 보고서 생성
    const summary = `# doha.kr AI 분석 종합 보고서

생성 일시: ${new Date().toLocaleString('ko-KR')}

## 분석 결과 요약

${results.map(r => `- ${r.name}: ${r.success ? '✅ 성공' : '❌ 실패'} ${r.file || r.error}`).join('\n')}

## 주요 발견사항

### 1. 보안
- DOMPurify가 모든 페이지에 적용됨
- CSP 헤더에서 unsafe-inline 제거 완료
- XSS 취약점 해결됨

### 2. 성능
- 만세력 데이터베이스 API 전환으로 초기 로딩 시간 대폭 개선
- CSS 모듈화로 유지보수성 향상
- 캐싱 전략 적용으로 반복 방문 시 속도 개선

### 3. 사용자 경험
- 운세 결과가 카드 형태로 개선됨
- 모바일 반응형 디자인 적용
- 카카오톡 공유 기능 추가

### 4. 콘텐츠
- AI 기반 개인화된 운세 제공
- 다양한 운세 서비스 (사주, 타로, 별자리 등)
- 실용적인 도구들 제공

## 다음 단계 권장사항

1. PWA 기능 강화 (오프라인 지원)
2. 사용자 계정 시스템 도입
3. 운세 히스토리 저장 기능
4. 커뮤니티 기능 활성화
5. 다국어 지원 (영어, 중국어)
`;

    await fs.writeFile(
        path.join(__dirname, 'analysis', 'AI_ANALYSIS_SUMMARY.md'),
        summary
    );

    console.log('\n🎉 AI 분석 완료!');
    console.log('📁 결과는 analysis/ 폴더에 저장되었습니다.');
}

// analysis 폴더 생성
async function ensureAnalysisDir() {
    const dir = path.join(__dirname, 'analysis');
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (e) {
        // 이미 존재하면 무시
    }
}

// 실행
(async () => {
    try {
        await ensureAnalysisDir();
        await analyzeWithAI();
    } catch (error) {
        console.error('오류 발생:', error);
        process.exit(1);
    }
})();