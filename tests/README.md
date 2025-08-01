# doha.kr 테스트 가이드

## 개요
doha.kr 프로젝트의 종합적인 테스트 인프라입니다. 단위 테스트, 통합 테스트, E2E 테스트를 포함합니다.

## 테스트 구조

```
tests/
├── unit/              # 단위 테스트
├── integration/       # 통합 테스트  
├── e2e/              # End-to-End 테스트
├── fixtures/         # 테스트 데이터
├── utils/            # 테스트 유틸리티
└── setup.js          # 전역 설정
```

## 설치

```bash
# 의존성 설치
npm install

# Playwright 브라우저 설치 (E2E 테스트용)
npm run playwright:install
```

## 테스트 실행

### 모든 테스트 실행
```bash
npm run test:all
```

### 단위 테스트
```bash
# 모든 단위 테스트
npm run test:unit

# 감시 모드
npm run test:watch

# 커버리지 포함
npm run test:coverage
```

### 통합 테스트
```bash
npm run test:integration
```

### E2E 테스트
```bash
# 기본 실행 (헤드리스)
npm run test:e2e

# UI 모드 (대화형)
npm run test:e2e:ui

# 디버그 모드
npm run test:e2e:debug

# 브라우저 표시
npm run test:e2e:headed
```

## 로컬 서버 실행

E2E 테스트를 위해 로컬 서버가 필요합니다:

```bash
# 개발 서버 (포트 3000)
npm run serve

# 또는 Vercel 개발 서버
npm run dev
```

## 테스트 작성 가이드

### 단위 테스트
```javascript
import { describe, it, expect } from 'vitest';

describe('모듈명', () => {
  it('기능 설명', () => {
    // 준비
    const input = 'test';
    
    // 실행
    const result = myFunction(input);
    
    // 검증
    expect(result).toBe('expected');
  });
});
```

### E2E 테스트
```javascript
import { test, expect } from '@playwright/test';

test('시나리오 설명', async ({ page }) => {
  // 페이지 방문
  await page.goto('/path');
  
  // 상호작용
  await page.click('button');
  
  // 검증
  await expect(page.locator('.result')).toBeVisible();
});
```

## 테스트 커버리지

목표 커버리지:
- 라인: 80%
- 함수: 80%
- 브랜치: 80%
- 구문: 80%

커버리지 리포트 보기:
```bash
npm run test:coverage
npm run serve:coverage
# 브라우저에서 http://localhost:8080 접속
```

## CI/CD 통합

GitHub Actions를 통해 자동으로 실행됩니다:
- Push to main/develop 브랜치
- Pull Request 생성 시
- 수동 실행 (workflow_dispatch)

## 테스트 우선순위

1. **Critical (P0)**
   - 로그인/인증
   - 결제 프로세스
   - 데이터 저장/불러오기

2. **High (P1)**
   - 주요 사용자 플로우
   - API 통합
   - 폼 유효성 검사

3. **Medium (P2)**
   - UI 컴포넌트
   - 에러 처리
   - 반응형 디자인

4. **Low (P3)**
   - 애니메이션
   - 툴팁/도움말
   - 부가 기능

## 디버깅 팁

### Vitest 디버깅
```bash
# VS Code 디버거 사용
# .vscode/launch.json에 설정 추가
```

### Playwright 디버깅
```bash
# 디버그 모드
npm run test:e2e:debug

# 특정 테스트만 실행
npx playwright test fortune-daily.spec.js

# 브라우저 개발자 도구 사용
await page.pause();
```

## 트러블슈팅

### 포트 충돌
```bash
# 3000번 포트 사용 중인 프로세스 종료
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Playwright 설치 오류
```bash
# 수동으로 브라우저 설치
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### 테스트 타임아웃
```javascript
// 특정 테스트의 타임아웃 증가
test('느린 테스트', async ({ page }) => {
  test.setTimeout(60000); // 60초
  // ...
});
```

## 베스트 프랙티스

1. **독립적인 테스트**: 각 테스트는 독립적으로 실행 가능해야 함
2. **명확한 이름**: 테스트가 무엇을 검증하는지 명확히 표현
3. **AAA 패턴**: Arrange(준비) - Act(실행) - Assert(검증)
4. **DRY 원칙**: 중복 코드는 헬퍼 함수로 추출
5. **빠른 실행**: 단위 테스트는 빠르게 실행되어야 함
6. **안정성**: Flaky 테스트 최소화

## 참고 자료

- [Vitest 문서](https://vitest.dev/)
- [Playwright 문서](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)