# GitHub Secrets 설정 가이드

## 필수 Secrets 설정

doha.kr 프로젝트의 완전한 CI/CD 파이프라인을 위해 GitHub Repository Settings > Secrets and variables > Actions에서 다음 secrets를 설정해야 합니다.

### Vercel 배포 관련
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

### API 인증
```
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_api_key_here  # fallback
```

### Cloudflare DNS 관리 (선택사항)
```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
```

### 모니터링 및 알림
```
SLACK_WEBHOOK_URL=your_slack_webhook_url_here      # 배포 알림
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here  # 대체 알림
```

### 코드 품질
```
CODECOV_TOKEN=your_codecov_token_here  # 커버리지 리포팅
```

## 환경별 변수 설정

### Production Environment
- `NODE_ENV=production`
- `BASE_URL=https://doha.kr`
- `API_BASE_URL=https://doha.kr/api`

### Staging Environment
- `NODE_ENV=staging`
- `BASE_URL=https://doha-staging.vercel.app`
- `API_BASE_URL=https://doha-staging.vercel.app/api`

## 보안 고려사항

1. **API 키 로테이션**: 주기적으로 API 키를 갱신하세요
2. **최소 권한 원칙**: 각 서비스에 필요한 최소한의 권한만 부여
3. **환경별 분리**: 프로덕션과 개발 환경의 키를 분리하여 관리
4. **모니터링**: API 사용량과 비정상적인 접근을 모니터링

## Vercel 환경 변수 동기화

GitHub Actions에서 설정한 환경 변수는 Vercel Dashboard에서도 동일하게 설정해야 합니다:

1. Vercel Dashboard > doha.kr > Settings > Environment Variables
2. Production/Preview/Development 환경별로 설정
3. GitHub Secrets와 동일한 값으로 설정

## 검증 방법

```bash
# 로컬에서 환경 변수 테스트
npm run deploy:check

# GitHub Actions에서 환경 변수 확인
# deploy.yml 워크플로우의 env-validation 단계에서 자동 검증
```

## 문제 해결

### API 인증 실패
1. GEMINI_API_KEY가 올바른지 확인
2. API 사용량 한도 확인
3. IP 제한 설정 확인

### Vercel 배포 실패
1. VERCEL_TOKEN 권한 확인
2. ORG_ID와 PROJECT_ID 정확성 확인
3. Vercel 계정의 배포 한도 확인

### DNS 전환 실패
1. Cloudflare API 토큰 권한 확인
2. Zone ID가 올바른지 확인
3. DNS 레코드 TTL 설정 확인