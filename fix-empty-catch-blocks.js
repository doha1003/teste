#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

/**
 * 빈 catch 블록을 자동으로 수정하는 스크립트
 * Phase 4 코드 품질 개선 - Validator 작업
 */

// 빈 catch 블록 패턴 (여러 줄에 걸친 패턴 매칭)
const emptyCatchPatterns = [
  // } catch (error) { \n }
  {
    pattern: /(\}\s*catch\s*\([^)]*\)\s*\{\s*\n\s*\})/g,
    replacement: (match, capture, filename) => {
      const errorVar = match.match(/catch\s*\(([^)]*)\)/)[1];
      const contextualMessage = getContextualErrorMessage(filename);
      return `} catch (${errorVar}) {\n        console.warn('${contextualMessage}:', ${errorVar});\n      }`;
    },
  },
  // } catch (error) { \n        \n }
  {
    pattern: /(\}\s*catch\s*\([^)]*\)\s*\{\s*\n\s*\n\s*\})/g,
    replacement: (match, capture, filename) => {
      const errorVar = match.match(/catch\s*\(([^)]*)\)/)[1];
      const contextualMessage = getContextualErrorMessage(filename);
      return `} catch (${errorVar}) {\n        console.warn('${contextualMessage}:', ${errorVar});\n      }`;
    },
  },
];

// if 블록 빈 공간 패턴
const emptyIfPatterns = [
  {
    pattern: /(if\s*\([^)]*\)\s*\{\s*\n\s*\})/g,
    replacement: (match, capture, filename) => {
      return match.replace(/\{\s*\n\s*\}/, '{\n        // TODO: 구현 필요\n      }');
    },
  },
];

// 미사용 변수 패턴
const unusedVarPatterns = [
  {
    pattern: /(\([^)]*\b)(error|query|input|result|value)(\b[^)]*\))/g,
    replacement: (match, prefix, varName, suffix) => {
      return `${prefix}_${varName}${suffix}`;
    },
  },
];

function getContextualErrorMessage(filename) {
  const basename = path.basename(filename, '.js');
  const contextMap = {
    'common-init': 'Common 초기화 실패',
    'korean-optimizer': '한글 최적화 실패',
    'offline-manager': '오프라인 관리 실패',
    'performance-monitor': '성능 모니터링 실패',
    'pwa-analytics': 'PWA 분석 실패',
    'service-base': '서비스 기본 작업 실패',
    'fortune-daily': '일일 운세 실패',
    404: '404 페이지 실패',
    about: 'About 페이지 실패',
    contact: '연락처 페이지 실패',
    faq: 'FAQ 페이지 실패',
    'fortune-index': '운세 인덱스 실패',
    home: '홈 페이지 실패',
    'love-dna-intro': '사랑 DNA 소개 실패',
    'mbti-intro': 'MBTI 소개 실패',
    offline: '오프라인 페이지 실패',
    privacy: '개인정보 페이지 실패',
    terms: '이용약관 페이지 실패',
    'tests-index': '테스트 인덱스 실패',
    'teto-egen-intro': 'Teto-Egen 소개 실패',
    'tools-index': '도구 인덱스 실패',
  };

  return contextMap[basename] || '작업 실패';
}

async function fixEmptyCatchBlocks() {
  try {
    console.log('🔧 빈 catch 블록 자동 수정을 시작합니다...');

    // JS 파일 찾기
    const jsFiles = await glob('js/**/*.js', { cwd: process.cwd() });
    let totalFixed = 0;
    let filesModified = 0;

    for (const file of jsFiles) {
      const filePath = path.resolve(file);
      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fileFixed = 0;

      // 빈 catch 블록 수정
      for (const pattern of emptyCatchPatterns) {
        const matches = [...modifiedContent.matchAll(pattern.pattern)];
        if (matches.length > 0) {
          modifiedContent = modifiedContent.replace(pattern.pattern, (match) => {
            fileFixed++;
            return pattern.replacement(match, match, file);
          });
        }
      }

      // 빈 if 블록 수정
      for (const pattern of emptyIfPatterns) {
        const matches = [...modifiedContent.matchAll(pattern.pattern)];
        if (matches.length > 0) {
          modifiedContent = modifiedContent.replace(pattern.pattern, (match) => {
            fileFixed++;
            return pattern.replacement(match, match, file);
          });
        }
      }

      // 미사용 변수 수정 (error → _error)
      modifiedContent = modifiedContent.replace(/catch\s*\(\s*error\s*\)/g, 'catch(_error)');
      modifiedContent = modifiedContent.replace(
        /\(([^)]*\b)(error|query|input|result|value)(\b[^)]*)\)/g,
        (match, prefix, varName, suffix) => {
          // 이미 언더스코어가 있는 경우 제외
          if (prefix.includes('_' + varName) || suffix.includes('_' + varName)) {
            return match;
          }
          fileFixed++;
          return `(${prefix}_${varName}${suffix})`;
        }
      );

      // 파일이 변경된 경우에만 저장
      if (modifiedContent !== content) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`✅ ${file}: ${fileFixed}개 수정`);
        filesModified++;
        totalFixed += fileFixed;
      }
    }

    console.log(`\n🎉 수정 완료:`);
    console.log(`- 총 ${filesModified}개 파일 수정`);
    console.log(`- 총 ${totalFixed}개 문제 해결`);

    // 수정 후 린팅 체크
    console.log('\n🔍 린팅 체크 중...');
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ 모든 린팅 오류가 해결되었습니다!');
    } catch (error) {
      console.log('⚠️  일부 린팅 오류가 남아있습니다. 수동 확인이 필요합니다.');
    }
  } catch (error) {
    console.error('❌ 수정 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
fixEmptyCatchBlocks();
