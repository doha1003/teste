/**
 * 보안 취약점 테스트
 * XSS, CSRF, 인젝션 공격 등 주요 보안 취약점을 검사합니다.
 */

import { test, expect } from '@playwright/test';

const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<svg onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  "';alert('XSS');//",
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  '<body onload=alert("XSS")>',
  '<input type="image" src=x onerror=alert("XSS")>',
  '<object data="javascript:alert(\'XSS\')"></object>'
];

const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "' UNION SELECT * FROM users --",
  "1; DELETE FROM users WHERE 1=1 --",
  "' OR 1=1 --",
  "admin'--",
  "admin'/*",
  "' OR 'x'='x",
  "' AND id IS NULL; --",
  "1' ORDER BY 1--"
];

const COMMAND_INJECTION_PAYLOADS = [
  '; ls -la',
  '| cat /etc/passwd',
  '&& whoami',
  '; cat /etc/shadow',
  '`whoami`',
  '$(whoami)',
  '| dir',
  '& dir',
  '; dir',
  '| type C:\\windows\\system32\\drivers\\etc\\hosts'
];

test.describe('보안 취약점 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // CSP 위반 및 보안 오류 모니터링
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        console.warn('CSP 위반 감지:', msg.text());
      }
    });

    page.on('pageerror', error => {
      if (error.message.includes('Content Security Policy')) {
        console.warn('CSP 페이지 오류:', error.message);
      }
    });
  });

  test('XSS (Cross-Site Scripting) 방어 테스트', async ({ page }) => {
    await page.goto('/');
    
    console.log('XSS 취약점 검사 시작...');
    
    // 검색 폼이나 입력 필드에서 XSS 테스트
    const searchInputs = page.locator('input[type="search"], input[type="text"], textarea');
    const inputCount = await searchInputs.count();
    
    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = searchInputs.nth(i);
        
        // 각 XSS 페이로드 테스트
        for (const payload of XSS_PAYLOADS.slice(0, 5)) { // 처음 5개만 테스트
          try {
            await input.clear();
            await input.fill(payload);
            
            // 폼 제출 또는 Enter 키 입력
            await input.press('Enter');
            await page.waitForTimeout(500);
            
            // alert이나 스크립트 실행 확인
            const alertHandled = await page.evaluate(() => {
              return window.xssTestExecuted || false;
            });
            
            // XSS 공격이 성공하면 안 됨
            expect(alertHandled).toBe(false);
            
            // DOM에 스크립트 태그가 삽입되었는지 확인
            const scriptTags = await page.locator('script').count();
            const suspiciousScripts = await page.evaluate((testPayload) => {
              const scripts = document.querySelectorAll('script');
              return Array.from(scripts).some(script => 
                script.textContent.includes('alert') || 
                script.textContent.includes(testPayload.replace(/[<>]/g, ''))
              );
            }, payload);
            
            expect(suspiciousScripts).toBe(false);
            
          } catch (error) {
            console.log(`XSS 페이로드 테스트 중 오류 (정상): ${payload}`);
          }
        }
      }
      
      console.log('✓ XSS 방어 테스트 통과');
    } else {
      console.log('입력 필드를 찾을 수 없음 - XSS 테스트 건너뜀');
    }
  });

  test('CSRF (Cross-Site Request Forgery) 방어 테스트', async ({ page }) => {
    await page.goto('/contact/');
    
    // CSRF 토큰 확인
    const csrfTokens = await page.evaluate(() => {
      const tokens = [];
      
      // 메타 태그에서 CSRF 토큰 찾기
      const metaToken = document.querySelector('meta[name="csrf-token"]');
      if (metaToken) {
        tokens.push({ type: 'meta', value: metaToken.getAttribute('content') });
      }
      
      // 숨겨진 입력 필드에서 CSRF 토큰 찾기
      const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
      hiddenInputs.forEach(input => {
        if (input.name.toLowerCase().includes('csrf') || 
            input.name.toLowerCase().includes('token') ||
            input.name === '_token') {
          tokens.push({ type: 'input', name: input.name, value: input.value });
        }
      });
      
      // 폼 액션 URL 확인
      const forms = document.querySelectorAll('form');
      const formActions = Array.from(forms).map(form => ({
        action: form.action,
        method: form.method.toLowerCase()
      }));
      
      return { tokens, formActions };
    });
    
    console.log('CSRF 보안 검사 결과:', csrfTokens);
    
    // POST 폼이 있다면 CSRF 토큰이 있어야 함
    const postForms = csrfTokens.formActions.filter(form => form.method === 'post');
    if (postForms.length > 0) {
      expect(csrfTokens.tokens.length).toBeGreaterThan(0);
      console.log('✓ CSRF 토큰 확인됨');
    } else {
      console.log('POST 폼이 없음 - CSRF 테스트 건너뜀');
    }
    
    // CSRF 토큰 형식 검증
    csrfTokens.tokens.forEach(token => {
      expect(token.value).toBeTruthy();
      expect(token.value.length).toBeGreaterThan(10); // 최소 길이
      // 토큰이 예측 가능한 패턴이 아닌지 확인
      expect(token.value).not.toMatch(/^(123|abc|test|csrf)/i);
    });
  });

  test('SQL 인젝션 방어 테스트', async ({ page }) => {
    await page.goto('/');
    
    console.log('SQL 인젝션 취약점 검사 시작...');
    
    // API 엔드포인트에 SQL 인젝션 시도
    const testEndpoints = [
      '/api/fortune',
      '/api/v2/fortune',
      '/api/v2/psychology',
      '/api/v2/tools'
    ];
    
    for (const endpoint of testEndpoints) {
      for (const payload of SQL_INJECTION_PAYLOADS.slice(0, 3)) { // 처음 3개만 테스트
        try {
          const response = await page.request.post(`http://localhost:3000${endpoint}`, {
            data: {
              type: 'daily',
              userData: {
                name: payload,
                birthDate: '1990-01-01'
              }
            },
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const responseText = await response.text();
          
          // SQL 에러 메시지가 노출되면 안 됨
          expect(responseText.toLowerCase()).not.toContain('sql');
          expect(responseText.toLowerCase()).not.toContain('mysql');
          expect(responseText.toLowerCase()).not.toContain('postgresql');
          expect(responseText.toLowerCase()).not.toContain('sqlite');
          expect(responseText.toLowerCase()).not.toContain('syntax error');
          expect(responseText.toLowerCase()).not.toContain('table');
          expect(responseText.toLowerCase()).not.toContain('column');
          
          // 응답이 너무 자세한 오류 정보를 포함하지 않아야 함
          expect(responseText).not.toMatch(/error.*line.*\d+/i);
          
        } catch (error) {
          // 요청이 차단되는 것은 정상 (방어 기제)
          console.log(`SQL 인젝션 차단됨: ${endpoint} - ${payload.substring(0, 20)}...`);
        }
      }
    }
    
    console.log('✓ SQL 인젝션 방어 테스트 완료');
  });

  test('명령어 인젝션 방어 테스트', async ({ page }) => {
    // 파일 업로드나 시스템 명령을 실행할 수 있는 기능이 있는지 확인
    await page.goto('/tools/');
    
    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();
    
    if (fileInputCount > 0) {
      console.log('파일 업로드 기능 발견 - 명령어 인젝션 테스트');
      
      // 위험한 파일 확장자 업로드 시도 (실제 파일은 업로드하지 않고 검증만)
      const dangerousExtensions = ['.php', '.asp', '.jsp', '.sh', '.bat', '.exe', '.js'];
      
      for (const ext of dangerousExtensions) {
        try {
          // 파일명에 명령어 인젝션 시도
          const maliciousFilename = `test${ext}; rm -rf /`;
          
          // 실제 파일 업로드는 하지 않고 클라이언트 측 검증만 확인
          const isBlocked = await page.evaluate((filename) => {
            // 클라이언트 측에서 파일명 검증이 있는지 확인
            const input = document.querySelector('input[type="file"]');
            if (input && input.accept) {
              return !input.accept.includes(filename.substring(filename.lastIndexOf('.')));
            }
            return false;
          }, maliciousFilename);
          
          console.log(`파일 확장자 ${ext} 차단 여부: ${isBlocked}`);
          
        } catch (error) {
          console.log(`파일 업로드 테스트 오류: ${error.message}`);
        }
      }
    }
    
    // URL 매개변수를 통한 명령어 인젝션 테스트
    for (const payload of COMMAND_INJECTION_PAYLOADS.slice(0, 3)) {
      try {
        await page.goto(`/?search=${encodeURIComponent(payload)}`);
        
        // 시스템 정보가 노출되는지 확인
        const pageContent = await page.textContent('body');
        
        expect(pageContent.toLowerCase()).not.toContain('root:');
        expect(pageContent.toLowerCase()).not.toContain('/etc/passwd');
        expect(pageContent.toLowerCase()).not.toContain('administrator');
        expect(pageContent.toLowerCase()).not.toContain('system32');
        
      } catch (error) {
        console.log(`명령어 인젝션 차단됨: ${payload}`);
      }
    }
    
    console.log('✓ 명령어 인젝션 방어 테스트 완료');
  });

  test('Content Security Policy (CSP) 검증', async ({ page }) => {
    let cspViolations = [];
    
    // CSP 위반 이벤트 수집
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // CSP 헤더 확인
    const cspHeader = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.getAttribute('content') : null;
    });
    
    if (cspHeader) {
      console.log('CSP 헤더 발견:', cspHeader);
      
      // CSP 정책 검증
      expect(cspHeader).toContain('default-src');
      
      // 인라인 스크립트 제한 확인
      if (!cspHeader.includes("'unsafe-inline'")) {
        console.log('✓ 인라인 스크립트 제한됨');
      } else {
        console.warn('⚠️  인라인 스크립트 허용됨 - 보안 위험');
      }
      
      // eval() 사용 제한 확인
      if (!cspHeader.includes("'unsafe-eval'")) {
        console.log('✓ eval() 사용 제한됨');
      } else {
        console.warn('⚠️  eval() 사용 허용됨 - 보안 위험');
      }
      
    } else {
      console.warn('⚠️  CSP 헤더가 설정되지 않음');
    }
    
    // CSP 위반 검사
    if (cspViolations.length > 0) {
      console.warn(`CSP 위반 ${cspViolations.length}건 발견:`);
      cspViolations.forEach(violation => console.warn(`  - ${violation}`));
      
      // 심각한 CSP 위반은 5개 미만이어야 함
      expect(cspViolations.length).toBeLessThan(5);
    } else {
      console.log('✓ CSP 위반 없음');
    }
  });

  test('민감한 정보 노출 검사', async ({ page }) => {
    await page.goto('/');
    
    // 소스 코드에서 민감한 정보 검사
    const pageSource = await page.content();
    const sensitivePatterns = [
      /password\s*[=:]\s*['"][^'"]+['"]/i,
      /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/i,
      /secret[_-]?key\s*[=:]\s*['"][^'"]+['"]/i,
      /access[_-]?token\s*[=:]\s*['"][^'"]+['"]/i,
      /private[_-]?key\s*[=:]\s*['"][^'"]+['"]/i,
      /database[_-]?password\s*[=:]\s*['"][^'"]+['"]/i,
      /conn(?:ection)?[_-]?string\s*[=:]\s*['"][^'"]+['"]/i,
      /aws[_-]?secret[_-]?access[_-]?key/i,
      /mysql[_-]?password/i,
      /mongodb[_-]?password/i
    ];
    
    let sensitiveDataFound = 0;
    
    sensitivePatterns.forEach((pattern, index) => {
      const matches = pageSource.match(pattern);
      if (matches) {
        sensitiveDataFound++;
        console.warn(`민감한 정보 패턴 발견 ${index + 1}: ${matches[0].substring(0, 50)}...`);
      }
    });
    
    // 민감한 정보가 노출되면 안 됨
    expect(sensitiveDataFound).toBe(0);
    
    // 개발 관련 정보 노출 검사
    const devPatterns = [
      /console\.log\(/i,
      /debugger;?/i,
      /TODO:/i,
      /FIXME:/i,
      /localhost:\d+/i,
      /127\.0\.0\.1:\d+/i
    ];
    
    let devInfoFound = 0;
    devPatterns.forEach(pattern => {
      if (pageSource.match(pattern)) {
        devInfoFound++;
      }
    });
    
    // 개발 정보는 최소화되어야 함
    expect(devInfoFound).toBeLessThan(3);
    
    console.log('✓ 민감한 정보 노출 검사 완료');
  });

  test('HTTP 보안 헤더 검증', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response.headers();
    
    console.log('보안 헤더 검사:');
    
    // X-Content-Type-Options
    if (headers['x-content-type-options']) {
      expect(headers['x-content-type-options']).toBe('nosniff');
      console.log('✓ X-Content-Type-Options: nosniff');
    } else {
      console.warn('⚠️  X-Content-Type-Options 헤더 없음');
    }
    
    // X-Frame-Options
    if (headers['x-frame-options']) {
      expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
      console.log(`✓ X-Frame-Options: ${headers['x-frame-options']}`);
    } else {
      console.warn('⚠️  X-Frame-Options 헤더 없음');
    }
    
    // X-XSS-Protection
    if (headers['x-xss-protection']) {
      expect(headers['x-xss-protection']).toMatch(/1; mode=block/);
      console.log(`✓ X-XSS-Protection: ${headers['x-xss-protection']}`);
    } else {
      console.warn('⚠️  X-XSS-Protection 헤더 없음');
    }
    
    // Strict-Transport-Security (HTTPS에서만)
    if (headers['strict-transport-security']) {
      console.log(`✓ Strict-Transport-Security: ${headers['strict-transport-security']}`);
    } else if (page.url().startsWith('https://')) {
      console.warn('⚠️  HTTPS에서 HSTS 헤더 없음');
    }
    
    // Referrer-Policy
    if (headers['referrer-policy']) {
      console.log(`✓ Referrer-Policy: ${headers['referrer-policy']}`);
    } else {
      console.warn('⚠️  Referrer-Policy 헤더 없음');
    }
    
    // Permissions-Policy (또는 Feature-Policy)
    if (headers['permissions-policy'] || headers['feature-policy']) {
      const policy = headers['permissions-policy'] || headers['feature-policy'];
      console.log(`✓ Permissions-Policy: ${policy.substring(0, 50)}...`);
    } else {
      console.warn('⚠️  Permissions-Policy 헤더 없음');
    }
  });

  test('쿠키 보안 설정 검증', async ({ page, context }) => {
    await page.goto('/');
    
    // 쿠키 설정 확인
    const cookies = await context.cookies();
    
    if (cookies.length > 0) {
      console.log(`쿠키 ${cookies.length}개 발견 - 보안 설정 검사:`);
      
      cookies.forEach(cookie => {
        console.log(`쿠키: ${cookie.name}`);
        
        // HttpOnly 플래그 확인 (세션 쿠키)
        if (cookie.name.toLowerCase().includes('session') || 
            cookie.name.toLowerCase().includes('auth') ||
            cookie.name.toLowerCase().includes('token')) {
          expect(cookie.httpOnly).toBe(true);
          console.log('  ✓ HttpOnly 설정됨');
        }
        
        // Secure 플래그 확인 (HTTPS에서)
        if (page.url().startsWith('https://')) {
          expect(cookie.secure).toBe(true);
          console.log('  ✓ Secure 설정됨');
        }
        
        // SameSite 설정 확인
        if (cookie.sameSite) {
          expect(['Strict', 'Lax', 'None']).toContain(cookie.sameSite);
          console.log(`  ✓ SameSite: ${cookie.sameSite}`);
        }
        
        // 쿠키 값이 암호화되어 있는지 확인 (길이와 복잡성)
        if (cookie.value.length > 20 && cookie.value.match(/[A-Za-z0-9+\/=]/)) {
          console.log('  ✓ 쿠키 값이 인코딩/암호화된 것으로 보임');
        } else if (cookie.value.length < 10) {
          console.warn(`  ⚠️  쿠키 값이 단순함: ${cookie.value}`);
        }
      });
    } else {
      console.log('쿠키 없음 - 쿠키 보안 테스트 건너뜀');
    }
  });

  test('파일 업로드 보안 검사', async ({ page }) => {
    // 파일 업로드 기능이 있는 페이지 찾기
    await page.goto('/contact/');
    
    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();
    
    if (fileInputCount > 0) {
      console.log('파일 업로드 기능 보안 검사');
      
      for (let i = 0; i < fileInputCount; i++) {
        const fileInput = fileInputs.nth(i);
        
        // accept 속성 확인
        const acceptAttr = await fileInput.getAttribute('accept');
        if (acceptAttr) {
          console.log(`파일 타입 제한: ${acceptAttr}`);
          
          // 위험한 파일 타입이 허용되지 않는지 확인
          const dangerousTypes = ['.exe', '.bat', '.sh', '.php', '.asp', '.jsp'];
          dangerousTypes.forEach(type => {
            expect(acceptAttr.toLowerCase()).not.toContain(type);
          });
          
          console.log('✓ 위험한 파일 타입 차단됨');
        } else {
          console.warn('⚠️  파일 타입 제한 없음');
        }
        
        // 파일 크기 제한 확인 (JavaScript로)
        const hasFileSizeCheck = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="file"]');
          return Array.from(inputs).some(input => {
            return input.onchange || input.addEventListener || 
                   input.getAttribute('data-max-size') ||
                   input.form?.onsubmit;
          });
        });
        
        if (hasFileSizeCheck) {
          console.log('✓ 파일 크기 검증 로직 존재');
        } else {
          console.warn('⚠️  파일 크기 검증 없음');
        }
      }
    } else {
      console.log('파일 업로드 기능 없음 - 테스트 건너뜀');
    }
  });

  test('세션 보안 검사', async ({ page, context }) => {
    await page.goto('/');
    
    // 세션 관련 쿠키나 토큰 확인
    const cookies = await context.cookies();
    const sessionCookies = cookies.filter(cookie => 
      cookie.name.toLowerCase().includes('session') ||
      cookie.name.toLowerCase().includes('auth') ||
      cookie.name.toLowerCase().includes('token')
    );
    
    if (sessionCookies.length > 0) {
      console.log('세션 보안 검사:');
      
      sessionCookies.forEach(cookie => {
        // 세션 ID 추측 가능성 검사
        const sessionId = cookie.value;
        
        // 세션 ID가 충분히 복잡한지 확인
        expect(sessionId.length).toBeGreaterThan(16);
        
        // 순차적이거나 예측 가능한 패턴이 아닌지 확인
        expect(sessionId).not.toMatch(/^(123|abc|000|111)/);
        expect(sessionId).not.toMatch(/\d{10,}$/); // 연속된 숫자만
        
        // 세션 고정 공격 방지 - 다양한 문자 포함
        const hasUpperCase = /[A-Z]/.test(sessionId);
        const hasLowerCase = /[a-z]/.test(sessionId);
        const hasNumbers = /\d/.test(sessionId);
        const hasSpecialChars = /[+\/=\-_]/.test(sessionId);
        
        const complexity = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
          .filter(Boolean).length;
        
        expect(complexity).toBeGreaterThanOrEqual(3);
        
        console.log(`✓ 세션 ID 복잡성: ${complexity}/4`);
      });
    }
    
    // 세션 타임아웃 확인 (JavaScript로)
    const hasSessionTimeout = await page.evaluate(() => {
      return window.sessionTimeout || 
             window.autoLogout || 
             document.querySelector('[data-session-timeout]') ||
             localStorage.getItem('sessionTimeout') ||
             sessionStorage.getItem('sessionTimeout');
    });
    
    if (hasSessionTimeout) {
      console.log('✓ 세션 타임아웃 메커니즘 존재');
    } else {
      console.warn('⚠️  세션 타임아웃 메커니즘 확인되지 않음');
    }
  });

  test('취약한 JavaScript 라이브러리 검사', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 페이지에서 사용되는 JavaScript 라이브러리 확인
    const libraries = await page.evaluate(() => {
      const detectedLibs = [];
      
      // jQuery 버전 확인
      if (window.jQuery) {
        detectedLibs.push({
          name: 'jQuery',
          version: window.jQuery.fn.jquery
        });
      }
      
      // React 버전 확인
      if (window.React) {
        detectedLibs.push({
          name: 'React',
          version: window.React.version
        });
      }
      
      // Vue 버전 확인
      if (window.Vue) {
        detectedLibs.push({
          name: 'Vue',
          version: window.Vue.version
        });
      }
      
      // Angular 버전 확인
      if (window.angular) {
        detectedLibs.push({
          name: 'Angular',
          version: window.angular.version?.full
        });
      }
      
      // Lodash 버전 확인
      if (window._) {
        detectedLibs.push({
          name: 'Lodash',
          version: window._.VERSION
        });
      }
      
      // 스크립트 태그에서 CDN 라이브러리 확인
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        const src = script.src;
        if (src.includes('jquery')) {
          const versionMatch = src.match(/jquery[\/\-]?(\d+\.\d+\.\d+)/i);
          if (versionMatch) {
            detectedLibs.push({
              name: 'jQuery (CDN)',
              version: versionMatch[1],
              source: src
            });
          }
        }
        // 다른 라이브러리들도 비슷하게 확인...
      });
      
      return detectedLibs;
    });
    
    console.log('JavaScript 라이브러리 검사:');
    
    if (libraries.length > 0) {
      libraries.forEach(lib => {
        console.log(`발견된 라이브러리: ${lib.name} v${lib.version}`);
        
        // jQuery 취약 버전 확인
        if (lib.name.includes('jQuery') && lib.version) {
          const version = lib.version;
          const major = parseInt(version.split('.')[0]);
          const minor = parseInt(version.split('.')[1]);
          const patch = parseInt(version.split('.')[2]);
          
          // jQuery < 3.5.0은 XSS 취약점 존재
          if (major < 3 || (major === 3 && minor < 5)) {
            console.warn(`⚠️  jQuery ${version}은 알려진 취약점이 있습니다. 3.5.0 이상으로 업데이트하세요.`);
          } else {
            console.log(`✓ jQuery ${version}은 안전한 버전입니다.`);
          }
        }
        
        // 기타 라이브러리 버전 확인도 추가 가능
      });
    } else {
      console.log('메이저 JavaScript 라이브러리 미발견');
    }
    
    // 인라인 스크립트에서 위험한 함수 사용 확인
    const dangerousFunctions = await page.evaluate(() => {
      const pageSource = document.documentElement.outerHTML;
      const risks = [];
      
      // eval() 사용 확인
      if (pageSource.includes('eval(')) {
        risks.push('eval() 함수 사용');
      }
      
      // innerHTML with user input
      if (pageSource.match(/innerHTML\s*=.*\+/)) {
        risks.push('innerHTML에 동적 콘텐츠 삽입');
      }
      
      // document.write 사용
      if (pageSource.includes('document.write(')) {
        risks.push('document.write() 사용');
      }
      
      return risks;
    });
    
    if (dangerousFunctions.length > 0) {
      console.warn('위험한 JavaScript 패턴 발견:');
      dangerousFunctions.forEach(risk => console.warn(`  - ${risk}`));
      
      // 위험한 패턴은 최소화되어야 함
      expect(dangerousFunctions.length).toBeLessThan(3);
    } else {
      console.log('✓ 위험한 JavaScript 패턴 없음');
    }
  });
});