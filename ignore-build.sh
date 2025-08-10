#!/bin/bash
# Vercel 빌드 최적화 스크립트
# 불필요한 빌드를 건너뛰어 배포 시간 단축

echo "🔍 Vercel 빌드 필요성 검사..."

# 현재 커밋과 이전 커밋 비교
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "📊 변경사항 분석: $VERCEL_GIT_PREVIOUS_SHA..$VERCEL_GIT_COMMIT_SHA"
  
  # 중요 파일/디렉토리 변경 확인
  IMPORTANT_CHANGES=$(git diff --name-only $VERCEL_GIT_PREVIOUS_SHA $VERCEL_GIT_COMMIT_SHA | grep -E '\.(js|css|html|json)$|^api/|^package\.json$|^vercel\.json$' || true)
  
  if [ -z "$IMPORTANT_CHANGES" ]; then
    echo "⏭️  중요한 변경사항 없음 - 빌드 건너뛰기"
    echo "📝 변경된 파일들:"
    git diff --name-only $VERCEL_GIT_PREVIOUS_SHA $VERCEL_GIT_COMMIT_SHA | head -10
    exit 0
  else
    echo "🔄 중요한 변경사항 발견 - 빌드 진행"
    echo "📝 변경된 중요 파일들:"
    echo "$IMPORTANT_CHANGES"
    exit 1
  fi
else
  echo "🆕 첫 번째 배포 또는 이전 SHA 없음 - 빌드 진행"
  exit 1
fi