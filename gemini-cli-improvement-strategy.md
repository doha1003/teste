# doha.kr 프로젝트 개선 전략 (Gemini CLI 활용)

## 🎯 핵심 문제점과 해결 전략

### 1. JavaScript 오류 검출 자동화
```bash
# 26개 페이지 자동 검증
node comprehensive-26-page-validator.js | gemini --prompt "이 오류들을 분석하고 우선순위별로 정리해주세요"
```

### 2. CSS/JS 참조 불일치 해결
```bash
# CSS 클래스 사용 분석
grep -r "class=" *.html | gemini --prompt "HTML에서 사용된 CSS 클래스와 실제 CSS 파일의 클래스를 비교 분석해주세요"
```

### 3. API 안정성 강화
- Rate limiting 개선: Redis 기반으로 전환
- 에러 핸들링: Fallback 응답 확대
- 캐싱 전략: Edge 캐싱 활용

### 4. 한국어 콘텐츠 품질 관리
- 존댓말 일관성 검사 자동화
- 문화적 민감성 체크리스트
- 번역투 표현 검출

### 5. PWA 성능 최적화
- Service Worker 캐싱 전략 개선
- Offline fallback 페이지 강화
- 앱 설치 프롬프트 최적화

## 📝 실행 가능한 액션 아이템

### Phase 1: 즉시 실행 (1-2일)
1. `npm run test:26pages` 실행 및 오류 수정
2. ESLint/Prettier 적용으로 코드 일관성 확보
3. API rate limiting 로직 검증

### Phase 2: 단기 개선 (1주일)
1. Vitest 단위 테스트 커버리지 80% 달성
2. Playwright E2E 테스트 시나리오 확대
3. 한국어 콘텐츠 일관성 검사 정기 실행

### Phase 3: 중장기 개선 (2-4주)
1. CI/CD 파이프라인 구축 (GitHub Actions)
2. 성능 모니터링 대시보드 구축
3. A/B 테스트 프레임워크 도입

## 🔧 Gemini CLI 활용 자동화 스크립트

### daily-check.sh
```bash
#\!/bin/bash
# 매일 실행할 검증 스크립트

echo "1. 코드 품질 검사"
npm run lint:fix

echo "2. 테스트 실행"
npm run test

echo "3. 빌드 검증"
npm run build

echo "4. Lighthouse 성능 측정"
npx lighthouse https://doha.kr --output=json | gemini --prompt "성능 지표를 분석하고 개선점을 제시해주세요"

echo "5. 한국어 콘텐츠 검증"
./verify-korean-content.sh
```

### api-health-check.sh
```bash
#\!/bin/bash
# API 상태 모니터링

endpoints=("/api/fortune" "/api/manseryeok" "/api/health")

for endpoint in "${endpoints[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "https://doha.kr$endpoint")
  echo "$endpoint: HTTP $response"
done | gemini --prompt "API 상태를 분석하고 이상 징후가 있으면 알려주세요"
```

## 📊 성공 지표 (KPIs)

1. **오류 감소율**: JavaScript 콘솔 오류 90% 감소
2. **성능 향상**: Lighthouse 점수 모든 항목 90+ 달성
3. **사용자 만족도**: 이탈률 20% 감소
4. **API 안정성**: 99.9% uptime 달성
5. **테스트 커버리지**: 80% 이상 유지

## 🚀 최종 권장사항

1. **Gemini CLI를 CI/CD에 통합**: 모든 PR에서 자동 코드 리뷰
2. **정기적인 품질 검사**: 매주 한국어 콘텐츠 검증
3. **성능 모니터링 자동화**: 매일 Lighthouse 실행 및 리포트
4. **사용자 피드백 수집**: 분기별 사용성 테스트

이 전략을 단계별로 실행하면 doha.kr 프로젝트의 품질과 안정성을 크게 향상시킬 수 있습니다.
