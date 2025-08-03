/**
 * 오늘의 운세 기능 모듈 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// Test helpers are now in setup.js as globals

describe('Fortune Daily Feature', () => {
  let container;
  let alertMock;

  beforeEach(async () => {
    // alert 모킹
    alertMock = vi.fn();
    window.alert = alertMock;

    // DOM 구조 생성
    container = document.createElement('div');
    container.innerHTML = `
      <form data-form="true">
        <input name="userName" id="userName" />
        <select id="birthYear" name="birthYear"></select>
        <select id="birthMonth" name="birthMonth"></select>
        <select id="birthDay" name="birthDay"></select>
        <select id="birthTime" name="birthTime">
          <option value="">시간 선택 (선택사항)</option>
          <option value="0">자시 (23:00-01:00)</option>
          <option value="1">축시 (01:00-03:00)</option>
        </select>
        <input type="checkbox" name="isLunar" id="isLunar" />
        <button type="submit">운세 보기</button>
      </form>
      <div class="spinner" style="display: none;">로딩중...</div>
      <div id="fortuneResult" style="display: none;"></div>
    `);

    // 모듈 로드
    await import('../../js/features/fortune-daily.js');

    // DOM에 추가
    document.body.appendChild(container);
    
    // DOM 준비 이벤트 발생
    window.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    container.remove();
    vi.clearAllMocks();
  });

  describe('폼 초기화', () => {
    it('연도 선택 옵션이 생성되어야 함', () => {
      const yearSelect = document.getElementById('birthYear');
      const currentYear = new Date().getFullYear();

      expect(yearSelect.options.length).toBeGreaterThan(50);
      expect(yearSelect.options[1].value).toBe(currentYear.toString());
      expect(yearSelect.options[1].textContent).toBe(`${currentYear}년`);
    });

    it('월 선택 시 일 옵션이 업데이트되어야 함', () => {
      const monthSelect = document.getElementById('birthMonth');
      const daySelect = document.getElementById('birthDay');

      // 3월 선택
      monthSelect.value = '3';
      monthSelect.dispatchEvent(new Event('change'));

      expect(daySelect.options.length).toBe(32); // 기본 옵션 + 31일
      expect(daySelect.options[31].value).toBe('31');
    });

    it('2월 선택 시 윤년을 고려해야 함', () => {
      const yearSelect = document.getElementById('birthYear');
      const monthSelect = document.getElementById('birthMonth');
      const daySelect = document.getElementById('birthDay');

      // 2024년 (윤년) 2월
      yearSelect.value = '2024';
      monthSelect.value = '2';
      monthSelect.dispatchEvent(new Event('change'));

      expect(daySelect.options.length).toBe(30); // 기본 옵션 + 29일

      // 2023년 (평년) 2월
      yearSelect.value = '2023';
      monthSelect.dispatchEvent(new Event('change'));

      expect(daySelect.options.length).toBe(29); // 기본 옵션 + 28일
    });

    it('30일까지만 있는 월을 처리해야 함', () => {
      const monthSelect = document.getElementById('birthMonth');
      const daySelect = document.getElementById('birthDay');

      // 4월 선택
      monthSelect.value = '4';
      monthSelect.dispatchEvent(new Event('change'));

      expect(daySelect.options.length).toBe(31); // 기본 옵션 + 30일
      expect(daySelect.options[30].value).toBe('30');
    });
  });

  describe('폼 제출 처리', () => {
    it('필수 필드가 비어있으면 알림을 표시해야 함', async () => {
      const form = document.querySelector('form[data-form="true"]');

      form.dispatchEvent(new Event('submit'));

      expect(alertMock).toHaveBeenCalledWith('모든 필수 항목을 입력해주세요.');
    });

    it('모든 필수 필드가 채워졌을 때 제출되어야 함', async () => {
      // 폼 데이터 입력
      document.getElementById('userName').value = '홍길동';
      document.getElementById('birthYear').value = '1990';
      document.getElementById('birthMonth').value = '5';

      // 일 옵션 생성
      document.getElementById('birthMonth').dispatchEvent(new Event('change'));

      document.getElementById('birthDay').value = '15';

      // API 응답 모킹
      global.fetch.mockResolvedValue(global.createMockResponse({
        success: true,
        fortune: '오늘은 좋은 일이 있을 거예요!',
      }));

      // 폼 제출
      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      expect(alertMock).not.toHaveBeenCalled();
    });

    it('음력 체크박스 상태를 포함해야 함', async () => {
      // 폼 데이터 입력
      document.getElementById('userName').value = '김철수';
      document.getElementById('birthYear').value = '1985';
      document.getElementById('birthMonth').value = '10';
      document.getElementById('birthMonth').dispatchEvent(new Event('change'));
      document.getElementById('birthDay').value = '20';
      document.getElementById('isLunar').checked = true;

      // API 호출 캡처를 위한 모킹
      let capturedBody;
      global.fetch.mockImplementationOnce(async (url, options) => {
        capturedBody = JSON.parse(options.body);
        return global.createMockResponse({ success: true, fortune: '테스트' });
      }));

      // 폼 제출
      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      expect(capturedBody.userData.isLunar).toBe(true);
    });

    it('선택적 시간 정보를 포함해야 함', async () => {
      // 폼 데이터 입력
      document.getElementById('userName').value = '이영희';
      document.getElementById('birthYear').value = '1995';
      document.getElementById('birthMonth').value = '3';
      document.getElementById('birthMonth').dispatchEvent(new Event('change'));
      document.getElementById('birthDay').value = '8';
      document.getElementById('birthTime').value = '1'; // 축시

      // API 호출 캡처
      let capturedBody;
      global.fetch.mockImplementationOnce(async (url, options) => {
        capturedBody = JSON.parse(options.body);
        return global.createMockResponse({ success: true, fortune: '테스트' });
      }));

      // 폼 제출
      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      expect(capturedBody.userData.birthHour).toBe(1);
    });
  });

  describe('로딩 상태 관리', () => {
    beforeEach(async () => {
      // 폼 데이터 입력
      document.getElementById('userName').value = '테스터';
      document.getElementById('birthYear').value = '2000';
      document.getElementById('birthMonth').value = '6';
      document.getElementById('birthMonth').dispatchEvent(new Event('change'));
      document.getElementById('birthDay').value = '15';
    });

    it('API 호출 중 로딩 스피너를 표시해야 함', async () => {
      const spinner = document.querySelector('.spinner');

      // 지연된 응답 모킹
      global.fetch.mockResolvedValue(global.createMockResponse({ success: true }, { delay: 100 });

      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      // 로딩 중 확인
      expect(spinner.style.display).toBe('block');
    });

    it('API 응답 후 로딩 스피너를 숨겨야 함', async () => {
      const spinner = document.querySelector('.spinner');

      global.fetch.mockResolvedValue(global.createMockResponse({
        success: true,
        fortune: '운세 결과',
      });

      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      // 응답 대기
      await vi.waitFor(() => {
        return spinner.style.display === 'none';
      });

      expect(spinner.style.display).toBe('none');
    });
  });

  describe('에러 처리', () => {
    beforeEach(async () => {
      // 폼 데이터 입력
      document.getElementById('userName').value = '테스터';
      document.getElementById('birthYear').value = '2000';
      document.getElementById('birthMonth').value = '6';
      document.getElementById('birthMonth').dispatchEvent(new Event('change'));
      document.getElementById('birthDay').value = '15';
    });

    it('API 에러 시 사용자에게 알림을 표시해야 함', async () => {
      global.fetch.mockResolvedValue(global.createMockResponse({
        success: false,
        error: 'Internal Server Error'
      }, 500));

      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      await vi.waitFor(() => alertMock.mock.calls.length > 0);

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('운세를 가져오는 중 오류가 발생했습니다')
      );
    });

    it('네트워크 에러를 처리해야 함', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      await vi.waitFor(() => alertMock.mock.calls.length > 0);

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('운세를 가져오는 중 오류가 발생했습니다')
      );
    });
  });

  describe('결과 표시', () => {
    beforeEach(async () => {
      // 폼 데이터 입력
      document.getElementById('userName').value = '홍길동';
      document.getElementById('birthYear').value = '1990';
      document.getElementById('birthMonth').value = '5';
      document.getElementById('birthMonth').dispatchEvent(new Event('change'));
      document.getElementById('birthDay').value = '15';
    });

    it('성공적인 운세 결과를 표시해야 함', async () => {
      const fortuneText = '오늘은 새로운 기회가 찾아올 것입니다. 긍정적인 마음가짐을 유지하세요.';

      global.fetch.mockResolvedValue(global.createMockResponse({
        success: true,
        fortune: fortuneText,
        luckyColor: '파란색',
        luckyNumber: 7,
      });

      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      await vi.waitFor(() => {
        const result = document.getElementById('fortuneResult');
        return result && result.style.display === 'block';
      });

      const result = document.getElementById('fortuneResult');
      expect(result.textContent).toContain(fortuneText);
      expect(result.textContent).toContain('파란색');
      expect(result.textContent).toContain('7');
    });

    it('사용자 이름을 포함한 개인화된 메시지를 표시해야 함', async () => {
      global.fetch.mockResolvedValue(global.createMockResponse({
        success: true,
        fortune: '좋은 하루가 될 것입니다.',
        personalMessage: '홍길동님, 오늘은 특별한 날입니다.',
      });

      const form = document.querySelector('form[data-form="true"]');
      form.dispatchEvent(new Event('submit'));

      await vi.waitFor(() => {
        const result = document.getElementById('fortuneResult');
        return result && result.textContent.includes('홍길동');
      });

      const result = document.getElementById('fortuneResult');
      expect(result.textContent).toContain('홍길동');
    });
  });
});
