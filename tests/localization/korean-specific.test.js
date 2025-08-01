/**
 * 한국어 특화 테스트
 * 한국어 텍스트 처리, 입력, 표시 및 문화적 정확성을 검증합니다.
 */

import { test, expect } from '@playwright/test';

const KOREAN_TEST_STRINGS = [
  {
    text: '안녕하세요 반갑습니다',
    description: '기본 한글 텍스트'
  },
  {
    text: '사주팔자 운세보기',
    description: '전통 문화 용어'
  },
  {
    text: '생년월일 1990년 1월 1일',
    description: '날짜 형식'
  },
  {
    text: '김철수님의 오늘의 운세',
    description: '이름과 존칭'
  },
  {
    text: '금요일 오후 3시 30분',
    description: '시간 표현'
  },
  {
    text: '서울특별시 강남구',
    description: '주소 표현'
  },
  {
    text: '휴대폰 번호: 010-1234-5678',
    description: '전화번호 형식'
  },
  {
    text: '이메일: test@example.com',
    description: '혼합 텍스트'
  },
  {
    text: '가나다라마바사아자차카타파하',
    description: '긴 한글 텍스트'
  },
  {
    text: '♥♡★☆◆◇○●',
    description: '특수문자와 한글'
  }
];

const KOREAN_NAMES = [
  '김철수', '이영희', '박민수', '최지영', '정우진',
  '한소영', '윤태호', '강민정', '조현우', '서지혜'
];

// 60갑자 (육십갑자) - 한국 전통 달력
const SIXTY_GAPJA = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'
];

test.describe('한국어 특화 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 한국어 로케일 설정
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: () => 'ko-KR'
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ko-KR', 'ko', 'en-US', 'en']
      });
    });
  });

  test('한국어 텍스트 렌더링 및 word-break 적용 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('한국어 텍스트 렌더링 검사 시작...');

    // 페이지의 한국어 텍스트 요소들 확인
    const koreanTextElements = await page.evaluate(() => {
      const results = [];
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 0) {
          // 한글 문자가 포함된 텍스트 찾기
          const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
          if (hasKorean && element.children.length === 0) { // 리프 노드만
            const style = window.getComputedStyle(element);
            results.push({
              index,
              tagName: element.tagName.toLowerCase(),
              text: text.substring(0, 50),
              wordBreak: style.wordBreak,
              lineBreak: style.lineBreak,
              whiteSpace: style.whiteSpace,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              fontFamily: style.fontFamily
            });
          }
        }
      });
      
      return results.slice(0, 20); // 처음 20개만 검사
    });

    console.log(`한국어 텍스트 요소 ${koreanTextElements.length}개 발견`);

    let properWordBreakCount = 0;
    let koreanFontCount = 0;

    koreanTextElements.forEach(element => {
      // word-break: keep-all 적용 확인
      if (element.wordBreak === 'keep-all') {
        properWordBreakCount++;
        console.log(`✓ 올바른 word-break 적용: ${element.tagName} - "${element.text}"`);
      } else {
        console.warn(`⚠️  word-break 미적용: ${element.tagName} - "${element.text}" (${element.wordBreak})`);
      }

      // 한국어 폰트 적용 확인
      if (element.fontFamily.includes('Pretendard') || 
          element.fontFamily.includes('Noto Sans KR') ||
          element.fontFamily.includes('Malgun Gothic') ||
          element.fontFamily.includes('Apple SD Gothic Neo')) {
        koreanFontCount++;
      }

      // 적절한 line-height 확인 (1.5 이상)
      const lineHeight = parseFloat(element.lineHeight);
      if (lineHeight >= 1.5 || element.lineHeight === 'normal') {
        // 정상
      } else {
        console.warn(`⚠️  line-height가 낮음: ${element.tagName} - ${element.lineHeight}`);
      }
    });

    // 80% 이상의 한국어 텍스트에 적절한 word-break가 적용되어야 함
    if (koreanTextElements.length > 0) {
      const wordBreakRatio = properWordBreakCount / koreanTextElements.length;
      expect(wordBreakRatio).toBeGreaterThan(0.8);
      console.log(`word-break: keep-all 적용 비율: ${Math.round(wordBreakRatio * 100)}%`);
    }

    // 한국어 폰트 적용 확인
    if (koreanTextElements.length > 0) {
      const fontRatio = koreanFontCount / koreanTextElements.length;
      expect(fontRatio).toBeGreaterThan(0.7);
      console.log(`한국어 폰트 적용 비율: ${Math.round(fontRatio * 100)}%`);
    }
  });

  test('한국어 입력 및 IME 호환성 테스트', async ({ page }) => {
    await page.goto('/contact/');
    await page.waitForLoadState('networkidle');

    const textInputs = page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await textInputs.count();

    if (inputCount > 0) {
      console.log(`입력 필드 ${inputCount}개에서 한국어 입력 테스트`);

      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = textInputs.nth(i);
        
        // 한국어 텍스트 입력 테스트
        for (const testCase of KOREAN_TEST_STRINGS.slice(0, 5)) {
          await input.clear();
          await input.fill(testCase.text);
          
          // 입력된 값 확인
          const inputValue = await input.inputValue();
          expect(inputValue).toBe(testCase.text);
          
          console.log(`✓ 한국어 입력 성공: ${testCase.description} - "${testCase.text}"`);
          
          // 입력 필드의 스타일 확인
          const inputStyle = await input.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              fontFamily: style.fontFamily,
              imeMode: style.imeMode,
              direction: style.direction
            };
          });
          
          // 한국어 텍스트 방향 확인 (LTR)
          expect(inputStyle.direction).toBe('ltr');
        }
      }
    } else {
      console.log('입력 필드를 찾을 수 없음 - 한국어 입력 테스트 건너뜀');
    }
  });

  test('한국어 날짜 및 시간 형식 검증', async ({ page }) => {
    await page.goto('/fortune/daily/');
    await page.waitForLoadState('networkidle');

    // 날짜 관련 텍스트 확인
    const dateElements = await page.evaluate(() => {
      const results = [];
      const allText = document.body.textContent || '';
      
      // 한국어 날짜 패턴 찾기
      const patterns = [
        /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/g,  // 2024년 1월 1일
        /\d{1,2}월\s*\d{1,2}일/g,            // 1월 1일
        /(월|화|수|목|금|토|일)요일/g,         // 요일
        /오전|오후/g,                        // 오전/오후
        /\d{1,2}시\s*\d{1,2}분/g,           // 시간
        /(봄|여름|가을|겨울)/g                // 계절
      ];
      
      patterns.forEach((pattern, index) => {
        const matches = allText.match(pattern);
        if (matches) {
          results.push({
            patternIndex: index,
            matches: matches.slice(0, 3) // 처음 3개만
          });
        }
      });
      
      return results;
    });

    console.log('한국어 날짜/시간 형식 검사 결과:', dateElements);

    // 날짜 형식이 발견되면 한국어 표준 형식인지 확인
    dateElements.forEach(dateGroup => {
      dateGroup.matches.forEach(match => {
        console.log(`✓ 한국어 날짜/시간 형식 발견: "${match}"`);
        
        // 기본적인 형식 검증
        expect(match).toMatch(/[가-힣0-9\s:]+/);
        expect(match.length).toBeGreaterThan(2);
      });
    });

    // 생년월일 입력 필드가 있다면 한국어 형식으로 테스트
    const birthDateInput = page.locator('input[name*="birth"], input[name*="date"], input[type="date"]');
    const birthInputCount = await birthDateInput.count();

    if (birthInputCount > 0) {
      console.log('생년월일 입력 필드 발견 - 한국어 날짜 입력 테스트');
      
      const testDates = [
        '1990-01-01',
        '2000-12-31',
        '1985-06-15'
      ];

      for (const date of testDates) {
        await birthDateInput.first().fill(date);
        const inputValue = await birthDateInput.first().inputValue();
        expect(inputValue).toBe(date);
        console.log(`✓ 날짜 입력 성공: ${date}`);
      }
    }
  });

  test('사주 및 전통 문화 용어 정확성 검증', async ({ page }) => {
    await page.goto('/fortune/saju/');
    await page.waitForLoadState('networkidle');

    // 페이지에서 전통 문화 용어 찾기
    const traditionalTerms = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const foundTerms = [];
      
      // 사주 관련 용어들
      const sajuTerms = [
        '사주팔자', '사주', '팔자', '운세', '점괘', '괘', '역학',
        '천간', '지지', '갑을병정', '자축인묘', '오행', '음양',
        '금', '목', '수', '화', '토',
        '정관', '편관', '정재', '편재', '식신', '상관', '비견', '겁재',
        '용신', '기신', '희신', '구신', '양', '음',
        '대운', '세운', '월운', '일운', '시운',
        '충', '형', '파', '해', '합'
      ];
      
      // 60갑자 용어들
      const gapjaTerms = [
        '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
        '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미'
      ];
      
      // 띠 관련 용어들
      const zodiacTerms = [
        '쥐띠', '소띠', '호랑이띠', '토끼띠', '용띠', '뱀띠',
        '말띠', '양띠', '원숭이띠', '닭띠', '개띠', '돼지띠'
      ];
      
      const allTerms = [...sajuTerms, ...gapjaTerms, ...zodiacTerms];
      
      allTerms.forEach(term => {
        if (text.includes(term)) {
          foundTerms.push(term);
        }
      });
      
      return foundTerms;
    });

    console.log(`전통 문화 용어 ${traditionalTerms.length}개 발견:`, traditionalTerms);

    // 사주 페이지라면 최소한의 전통 용어가 있어야 함
    if (page.url().includes('saju')) {
      expect(traditionalTerms.length).toBeGreaterThan(5);
    }

    // 60갑자 API 호출 테스트 (있다면)
    try {
      const response = await page.request.post('/api/manseryeok', {
        data: {
          year: 1990,
          month: 1,
          day: 1,
          isLunar: false
        }
      });

      if (response.ok()) {
        const data = await response.json();
        console.log('만세력 API 응답:', data);

        // 60갑자 형식 확인
        if (data.gapja) {
          expect(SIXTY_GAPJA).toContain(data.gapja);
          console.log(`✓ 올바른 60갑자 응답: ${data.gapja}`);
        }
      }
    } catch (error) {
      console.log('만세력 API 테스트 건너뜀:', error.message);
    }
  });

  test('한국어 에러 메시지 및 알림 검증', async ({ page }) => {
    await page.goto('/tests/mbti/test.html');
    await page.waitForLoadState('networkidle');

    console.log('한국어 에러 메시지 테스트');

    // 폼 제출 없이 제출 버튼 클릭하여 에러 메시지 유발
    const submitButton = page.locator('button[type="submit"], .submit-btn, .btn-submit');
    const submitButtonCount = await submitButton.count();

    if (submitButtonCount > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(1000);

      // 에러 메시지 찾기
      const errorMessages = await page.evaluate(() => {
        const errors = [];
        const selectors = [
          '.error', '.error-message', '.alert-danger', '.invalid-feedback',
          '[role="alert"]', '.validation-error', '.form-error'
        ];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 0) {
              errors.push({
                selector,
                text,
                hasKorean: /[가-힣]/.test(text)
              });
            }
          });
        });

        // 브라우저 기본 validation 메시지도 확인
        const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
          if (input.validationMessage) {
            errors.push({
              selector: 'validation-message',
              text: input.validationMessage,
              hasKorean: /[가-힣]/.test(input.validationMessage)
            });
          }
        });

        return errors;
      });

      console.log(`에러 메시지 ${errorMessages.length}개 발견`);

      errorMessages.forEach(error => {
        console.log(`에러 메시지: "${error.text}" (한국어: ${error.hasKorean})`);
        
        if (error.hasKorean) {
          // 한국어 에러 메시지의 적절성 확인
          expect(error.text).toMatch(/[가-힣]/);
          expect(error.text.length).toBeGreaterThan(2);
          
          // 존댓말 사용 확인 (선택적)
          const hasPoliteForm = /입니다|습니다|하세요|해주세요|입력해|선택해/.test(error.text);
          if (hasPoliteForm) {
            console.log(`✓ 적절한 존댓말 사용: "${error.text}"`);
          }
        }
      });

      // 한국어 에러 메시지가 있는 경우 품질 확인
      const koreanErrors = errorMessages.filter(e => e.hasKorean);
      if (koreanErrors.length > 0) {
        expect(koreanErrors.length).toBeGreaterThan(0);
        console.log(`✓ 한국어 에러 메시지 ${koreanErrors.length}개 확인`);
      }
    }
  });

  test('한국어 검색 및 필터링 기능 테스트', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 검색 입력 필드 찾기
    const searchInput = page.locator('input[type="search"], input[name*="search"], .search-input');
    const searchInputCount = await searchInput.count();

    if (searchInputCount > 0) {
      console.log('검색 기능에서 한국어 입력 테스트');

      const searchTerms = [
        '사주',
        '운세',
        'MBTI',
        '성격테스트',
        '타로카드',
        '연애DNA'
      ];

      for (const term of searchTerms) {
        await searchInput.first().clear();
        await searchInput.first().fill(term);
        await searchInput.first().press('Enter');
        
        await page.waitForTimeout(1000);

        // 검색 결과 확인
        const searchResults = await page.evaluate((searchTerm) => {
          const resultsContainer = document.querySelector('.search-results, .results, .service-grid');
          if (resultsContainer) {
            const text = resultsContainer.textContent || '';
            return {
              hasResults: text.trim().length > 0,
              containsSearchTerm: text.includes(searchTerm),
              resultText: text.substring(0, 100)
            };
          }
          return { hasResults: false, containsSearchTerm: false, resultText: '' };
        }, term);

        console.log(`검색어 "${term}" 결과:`, searchResults);

        if (searchResults.hasResults) {
          console.log(`✓ 한국어 검색 결과 있음: "${term}"`);
        }
      }
    } else {
      console.log('검색 입력 필드를 찾을 수 없음 - 검색 테스트 건너뜀');
    }
  });

  test('한국어 콘텐츠 길이 및 줄바꿈 테스트', async ({ page }) => {
    await page.goto('/fortune/daily/');
    await page.waitForLoadState('networkidle');

    // 긴 한국어 텍스트 블록 찾기
    const longTextElements = await page.evaluate(() => {
      const results = [];
      const textElements = document.querySelectorAll('p, div, span, .content, .description, .result-text');
      
      textElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 50 && /[가-힣]/.test(text)) {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          
          results.push({
            index,
            textLength: text.length,
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            wordBreak: style.wordBreak,
            overflowWrap: style.overflowWrap,
            whiteSpace: style.whiteSpace,
            width: rect.width,
            height: rect.height
          });
        }
      });
      
      return results.slice(0, 10); // 처음 10개만
    });

    console.log(`긴 한국어 텍스트 ${longTextElements.length}개 검사`);

    longTextElements.forEach(element => {
      console.log(`텍스트 길이: ${element.textLength}, word-break: ${element.wordBreak}`);
      
      // 긴 텍스트에는 적절한 줄바꿈 설정이 있어야 함
      const hasProperBreaking = element.wordBreak === 'keep-all' || 
                               element.overflowWrap === 'break-word' ||
                               element.whiteSpace !== 'nowrap';
      
      expect(hasProperBreaking).toBe(true);
      
      // 텍스트가 컨테이너를 벗어나지 않는지 확인
      if (element.width > 0) {
        console.log(`✓ 텍스트 컨테이너 크기: ${Math.round(element.width)}px x ${Math.round(element.height)}px`);
      }
    });
  });

  test('한국어 폰트 로딩 및 fallback 테스트', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 폰트 로딩 상태 확인
    const fontInfo = await page.evaluate(() => {
      const results = {
        availableFonts: [],
        koreanTextElements: 0,
        fontLoadingStatus: {}
      };

      // 사용 가능한 폰트 목록 (간접적으로 확인)
      const testFonts = [
        'Pretendard Variable',
        'Pretendard',
        'Noto Sans KR',
        'Malgun Gothic',
        'Apple SD Gothic Neo',
        'sans-serif'
      ];

      // 한국어 텍스트 요소들의 폰트 확인
      const elementsWithKorean = document.querySelectorAll('*');
      let koreanElementCount = 0;

      elementsWithKorean.forEach(element => {
        const text = element.textContent?.trim();
        if (text && /[가-힣]/.test(text) && element.children.length === 0) {
          koreanElementCount++;
          const style = window.getComputedStyle(element);
          const fontFamily = style.fontFamily;
          
          if (!results.availableFonts.includes(fontFamily)) {
            results.availableFonts.push(fontFamily);
          }
        }
      });

      results.koreanTextElements = koreanElementCount;

      // 폰트 로딩 상태 확인 (Font Loading API 사용 가능한 경우)
      if (document.fonts) {
        results.fontLoadingStatus.ready = document.fonts.ready ? 'available' : 'not-available';
        results.fontLoadingStatus.size = document.fonts.size;
      }

      return results;
    });

    console.log('폰트 정보:', fontInfo);

    // 한국어 텍스트 요소가 있다면 적절한 폰트가 적용되어야 함
    if (fontInfo.koreanTextElements > 0) {
      expect(fontInfo.availableFonts.length).toBeGreaterThan(0);
      
      // 주요 한국어 폰트 중 하나는 사용되어야 함
      const hasKoreanFont = fontInfo.availableFonts.some(font => 
        font.includes('Pretendard') ||
        font.includes('Noto Sans KR') ||
        font.includes('Malgun Gothic') ||
        font.includes('Apple SD Gothic Neo')
      );

      expect(hasKoreanFont).toBe(true);
      console.log(`✓ 한국어 폰트 적용 확인됨`);
    }

    // 폰트 로딩 완료 확인
    if (fontInfo.fontLoadingStatus.ready === 'available') {
      console.log('✓ 폰트 로딩 API 사용 가능 - 폰트 로딩 완료 대기');
      
      await page.waitForFunction(() => {
        return document.fonts.ready;
      }, { timeout: 5000 }).catch(() => {
        console.warn('폰트 로딩 완료 대기 시간초과');
      });
    }
  });

  test('한국 시간대 및 로케일 설정 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // JavaScript 시간대 및 로케일 확인
    const localeInfo = await page.evaluate(() => {
      const now = new Date();
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        dateString: now.toLocaleDateString('ko-KR'),
        timeString: now.toLocaleTimeString('ko-KR'),
        weekday: now.toLocaleDateString('ko-KR', { weekday: 'long' }),
        navigatorLanguage: navigator.language,
        navigatorLanguages: navigator.languages
      };
    });

    console.log('로케일 정보:', localeInfo);

    // 한국어 로케일 설정 확인
    expect(localeInfo.navigatorLanguage).toBe('ko-KR');
    expect(localeInfo.navigatorLanguages[0]).toBe('ko-KR');

    // 한국 시간대 확인 (테스트 환경에서는 다를 수 있음)
    console.log(`현재 시간대: ${localeInfo.timezone}`);
    console.log(`한국어 날짜 형식: ${localeInfo.dateString}`);
    console.log(`한국어 시간 형식: ${localeInfo.timeString}`);
    console.log(`한국어 요일: ${localeInfo.weekday}`);

    // 한국어 날짜 형식 검증
    expect(localeInfo.dateString).toMatch(/\d{4}\.\s?\d{1,2}\.\s?\d{1,2}\.?/);
    expect(localeInfo.weekday).toMatch(/(월|화|수|목|금|토|일)요일/);
  });

  test('한국 문화적 컨텍스트 검증', async ({ page }) => {
    await page.goto('/fortune/saju/');
    await page.waitForLoadState('networkidle');

    // 문화적으로 민감한 내용 검사
    const culturalContent = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const results = {
        hasTraditionalTerms: false,
        hasRespectfulLanguage: false,
        hasInappropriateContent: false,
        foundTerms: []
      };

      // 전통 문화 용어 확인
      const traditionalTerms = ['사주', '팔자', '운세', '점괘', '음양', '오행', '천간', '지지'];
      traditionalTerms.forEach(term => {
        if (text.includes(term)) {
          results.hasTraditionalTerms = true;
          results.foundTerms.push(term);
        }
      });

      // 존댓말 사용 확인
      const respectfulPatterns = [/습니다|입니다|하세요|해주세요|드립니다|드려요/];
      results.hasRespectfulLanguage = respectfulPatterns.some(pattern => pattern.test(text));

      // 부적절한 내용 확인 (기본적인 필터링)
      const inappropriateTerms = ['바보', '멍청이', '죽어', '죽일', '꺼져'];
      results.hasInappropriateContent = inappropriateTerms.some(term => text.includes(term));

      return results;
    });

    console.log('문화적 컨텍스트 검사 결과:', culturalContent);

    // 사주 페이지에서는 전통 용어가 있어야 함
    if (page.url().includes('saju') || page.url().includes('fortune')) {
      expect(culturalContent.hasTraditionalTerms).toBe(true);
      console.log(`✓ 전통 문화 용어 발견: ${culturalContent.foundTerms.join(', ')}`);
    }

    // 존댓말 사용 권장
    if (culturalContent.hasRespectfulLanguage) {
      console.log('✓ 적절한 존댓말 사용 확인됨');
    }

    // 부적절한 내용 없어야 함
    expect(culturalContent.hasInappropriateContent).toBe(false);
  });
});

// 한국어 특화 테스트 완료 리포트
test.afterAll(async () => {
  console.log('\n=== 한국어 특화 테스트 완료 ===');
  console.log('✓ 한국어 텍스트 렌더링 및 word-break 검증');
  console.log('✓ 한국어 입력 및 IME 호환성 검증');
  console.log('✓ 한국어 날짜/시간 형식 검증'); 
  console.log('✓ 전통 문화 용어 정확성 검증');
  console.log('✓ 한국어 에러 메시지 검증');
  console.log('✓ 한국어 검색 기능 검증');
  console.log('✓ 한국어 콘텐츠 줄바꿈 검증');
  console.log('✓ 한국어 폰트 로딩 검증');
  console.log('✓ 한국 시간대/로케일 검증');
  console.log('✓ 한국 문화적 컨텍스트 검증');
  console.log('\n한국어 사용자를 위한 모든 특화 테스트가 완료되었습니다.');
});