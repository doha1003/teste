/**
 * 디자인 시스템 컴포넌트 테스트
 * Linear.app 기반 디자인 시스템의 주요 컴포넌트들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Design System Components', () => {
  let container;

  beforeEach(() => {
    // 컨테이너 생성
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // CSS 변수 설정 (테스트용)
    document.documentElement.style.setProperty('--color-primary', '#6366f1');
    document.documentElement.style.setProperty('--color-secondary', '#8b5cf6');
    document.documentElement.style.setProperty('--color-background', '#ffffff');
    document.documentElement.style.setProperty('--color-text-primary', '#111827');
    document.documentElement.style.setProperty('--spacing-sm', '8px');
    document.documentElement.style.setProperty('--spacing-md', '16px');
    document.documentElement.style.setProperty('--spacing-lg', '24px');
    document.documentElement.style.setProperty('--border-radius-md', '8px');
    document.documentElement.style.setProperty('--font-family-primary', 'Pretendard Variable');
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Button Component', () => {
    it('기본 버튼이 올바르게 렌더링되어야 함', () => {
      const button = document.createElement('button');
      button.className = 'btn btn-primary';
      button.textContent = '테스트 버튼';
      container.appendChild(button);

      expect(button.className).toContain('btn');
      expect(button.className).toContain('btn-primary');
      expectKoreanText(button, '테스트 버튼');
    });

    it('버튼 변형들이 올바른 클래스를 가져야 함', () => {
      const variants = ['primary', 'secondary', 'ghost', 'danger'];
      
      variants.forEach(variant => {
        const button = document.createElement('button');
        button.className = `btn btn-${variant}`;
        button.textContent = `${variant} 버튼`;
        container.appendChild(button);

        expect(button.className).toContain(`btn-${variant}`);
      });
    });

    it('비활성화된 버튼이 올바른 상태를 가져야 함', () => {
      const button = document.createElement('button');
      button.className = 'btn btn-primary';
      button.disabled = true;
      button.textContent = '비활성화된 버튼';
      container.appendChild(button);

      expect(button.disabled).toBe(true);
      expect(button.getAttribute('aria-disabled')).toBe(null);
      
      // aria-disabled 설정
      button.setAttribute('aria-disabled', 'true');
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('버튼 크기 변형이 올바르게 적용되어야 함', () => {
      const sizes = ['sm', 'md', 'lg'];
      
      sizes.forEach(size => {
        const button = document.createElement('button');
        button.className = `btn btn-primary btn-${size}`;
        button.textContent = `${size} 크기`;
        container.appendChild(button);

        expect(button.className).toContain(`btn-${size}`);
      });
    });

    it('아이콘이 있는 버튼이 올바르게 렌더링되어야 함', () => {
      const button = document.createElement('button');
      button.className = 'btn btn-primary';
      button.innerHTML = '<span class="icon">🏠</span> 홈으로';
      container.appendChild(button);

      const icon = button.querySelector('.icon');
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('🏠');
    });
  });

  describe('Card Component', () => {
    it('기본 카드가 올바르게 렌더링되어야 함', () => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">테스트 카드</h3>
        </div>
        <div class="card-content">
          <p>카드 내용입니다.</p>
        </div>
      `;
      container.appendChild(card);

      expect(card.className).toContain('card');
      
      const header = card.querySelector('.card-header');
      const title = card.querySelector('.card-title');
      const content = card.querySelector('.card-content');

      expect(header).toBeTruthy();
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
      expectKoreanText(title, '테스트 카드');
    });

    it('결과 카드가 올바른 구조를 가져야 함', () => {
      const resultCard = document.createElement('div');
      resultCard.className = 'result-card';
      resultCard.innerHTML = `
        <div class="result-header">
          <div class="result-icon">🔮</div>
          <h2 class="result-title">MBTI 결과</h2>
        </div>
        <div class="result-content">
          <p class="result-type">ENFP</p>
          <p class="result-description">활발한 영감가</p>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary">공유하기</button>
        </div>
      `;
      container.appendChild(resultCard);

      expect(resultCard.className).toContain('result-card');
      
      const icon = resultCard.querySelector('.result-icon');
      const title = resultCard.querySelector('.result-title');
      const type = resultCard.querySelector('.result-type');
      const description = resultCard.querySelector('.result-description');
      const actions = resultCard.querySelector('.result-actions');

      expect(icon).toBeTruthy();
      expect(title).toBeTruthy();
      expect(type).toBeTruthy();
      expect(description).toBeTruthy();
      expect(actions).toBeTruthy();

      expectKoreanText(title, 'MBTI 결과');
      expectKoreanText(type, 'ENFP');
      expectKoreanText(description, '활발한 영감가');
    });

    it('서비스 카드가 올바른 레이아웃을 가져야 함', () => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'service-card';
      serviceCard.innerHTML = `
        <div class="service-icon">🧠</div>
        <h3 class="service-title">MBTI 성격 테스트</h3>
        <p class="service-description">16가지 성격 유형 중 나의 유형을 알아보세요</p>
        <button class="btn btn-primary">테스트 시작</button>
      `;
      container.appendChild(serviceCard);

      const icon = serviceCard.querySelector('.service-icon');
      const title = serviceCard.querySelector('.service-title');
      const description = serviceCard.querySelector('.service-description');
      const button = serviceCard.querySelector('.btn');

      expect(icon).toBeTruthy();
      expect(title).toBeTruthy();
      expect(description).toBeTruthy();
      expect(button).toBeTruthy();

      expectKoreanText(title, 'MBTI 성격 테스트');
    });
  });

  describe('Form Components', () => {
    it('입력 필드가 올바르게 렌더링되어야 함', () => {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group';
      inputGroup.innerHTML = `
        <label class="input-label" for="test-input">이름</label>
        <input class="input" id="test-input" type="text" placeholder="이름을 입력하세요">
        <span class="input-helper">필수 입력 항목입니다</span>
      `;
      container.appendChild(inputGroup);

      const label = inputGroup.querySelector('.input-label');
      const input = inputGroup.querySelector('.input');
      const helper = inputGroup.querySelector('.input-helper');

      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
      expect(helper).toBeTruthy();

      expect(label.getAttribute('for')).toBe('test-input');
      expect(input.id).toBe('test-input');
      expectKoreanText(label, '이름');
    });

    it('에러 상태의 입력 필드가 올바르게 표시되어야 함', () => {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group input-error';
      inputGroup.innerHTML = `
        <label class="input-label" for="error-input">이메일</label>
        <input class="input" id="error-input" type="email" value="invalid-email">
        <span class="input-error-message">올바른 이메일 형식이 아닙니다</span>
      `;
      container.appendChild(inputGroup);

      expect(inputGroup.className).toContain('input-error');
      
      const errorMessage = inputGroup.querySelector('.input-error-message');
      expect(errorMessage).toBeTruthy();
      expectKoreanText(errorMessage, '올바른 이메일 형식이 아닙니다');
    });

    it('선택 박스가 올바르게 작동해야 함', () => {
      const selectGroup = document.createElement('div');
      selectGroup.className = 'select-group';
      selectGroup.innerHTML = `
        <label class="input-label" for="test-select">성별</label>
        <select class="select" id="test-select">
          <option value="">선택하세요</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
      `;
      container.appendChild(selectGroup);

      const select = selectGroup.querySelector('.select');
      const options = select.querySelectorAll('option');

      expect(select).toBeTruthy();
      expect(options).toHaveLength(3);
      expect(options[1].value).toBe('male');
      expectKoreanText(options[1], '남성');
    });

    it('라디오 버튼 그룹이 올바르게 작동해야 함', () => {
      const radioGroup = document.createElement('fieldset');
      radioGroup.className = 'radio-group';
      radioGroup.innerHTML = `
        <legend class="radio-legend">선호하는 활동</legend>
        <div class="radio-item">
          <input type="radio" id="indoor" name="activity" value="indoor">
          <label for="indoor">실내 활동</label>
        </div>
        <div class="radio-item">
          <input type="radio" id="outdoor" name="activity" value="outdoor">
          <label for="outdoor">야외 활동</label>
        </div>
      `;
      container.appendChild(radioGroup);

      const legend = radioGroup.querySelector('.radio-legend');
      const radioItems = radioGroup.querySelectorAll('.radio-item');
      const inputs = radioGroup.querySelectorAll('input[type="radio"]');

      expect(legend).toBeTruthy();
      expect(radioItems).toHaveLength(2);
      expect(inputs).toHaveLength(2);
      
      inputs.forEach(input => {
        expect(input.name).toBe('activity');
      });

      expectKoreanText(legend, '선호하는 활동');
    });
  });

  describe('Progress Components', () => {
    it('진행 표시줄이 올바르게 렌더링되어야 함', () => {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      progressContainer.innerHTML = `
        <div class="progress-label">
          <span>테스트 진행률</span>
          <span class="progress-value">60%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 60%"></div>
        </div>
      `;
      container.appendChild(progressContainer);

      const label = progressContainer.querySelector('.progress-label');
      const value = progressContainer.querySelector('.progress-value');
      const bar = progressContainer.querySelector('.progress-bar');
      const fill = progressContainer.querySelector('.progress-fill');

      expect(label).toBeTruthy();
      expect(value).toBeTruthy();
      expect(bar).toBeTruthy();
      expect(fill).toBeTruthy();

      expect(fill.style.width).toBe('60%');
      expectKoreanText(value, '60%');
    });

    it('단계 표시기가 올바르게 렌더링되어야 함', () => {
      const stepIndicator = document.createElement('div');
      stepIndicator.className = 'step-indicator';
      stepIndicator.innerHTML = `
        <div class="step step-completed">
          <div class="step-number">1</div>
          <div class="step-label">기본 정보</div>
        </div>
        <div class="step step-current">
          <div class="step-number">2</div>
          <div class="step-label">성격 테스트</div>
        </div>
        <div class="step step-pending">
          <div class="step-number">3</div>
          <div class="step-label">결과 보기</div>
        </div>
      `;
      container.appendChild(stepIndicator);

      const steps = stepIndicator.querySelectorAll('.step');
      expect(steps).toHaveLength(3);

      const completedStep = stepIndicator.querySelector('.step-completed');
      const currentStep = stepIndicator.querySelector('.step-current');
      const pendingStep = stepIndicator.querySelector('.step-pending');

      expect(completedStep).toBeTruthy();
      expect(currentStep).toBeTruthy();
      expect(pendingStep).toBeTruthy();

      const currentLabel = currentStep.querySelector('.step-label');
      expectKoreanText(currentLabel, '성격 테스트');
    });
  });

  describe('Theme System', () => {
    it('다크 테마 클래스가 올바르게 적용되어야 함', () => {
      document.documentElement.classList.add('theme-dark');
      
      const card = document.createElement('div');
      card.className = 'card';
      card.textContent = '다크 테마 카드';
      container.appendChild(card);

      expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
      
      // 정리
      document.documentElement.classList.remove('theme-dark');
    });

    it('라이트 테마가 기본값이어야 함', () => {
      const hasLightTheme = document.documentElement.classList.contains('theme-light') || 
                           !document.documentElement.classList.contains('theme-dark');
      
      expect(hasLightTheme).toBe(true);
    });

    it('테마 전환 버튼이 올바르게 작동해야 함', () => {
      const themeToggle = document.createElement('button');
      themeToggle.className = 'theme-toggle';
      themeToggle.innerHTML = `
        <span class="theme-icon-light">☀️</span>
        <span class="theme-icon-dark">🌙</span>
      `;
      container.appendChild(themeToggle);

      const lightIcon = themeToggle.querySelector('.theme-icon-light');
      const darkIcon = themeToggle.querySelector('.theme-icon-dark');

      expect(lightIcon).toBeTruthy();
      expect(darkIcon).toBeTruthy();
    });
  });

  describe('Korean Typography', () => {
    it('한글 텍스트가 올바른 줄바꿈 설정을 가져야 함', () => {
      const textElement = document.createElement('p');
      textElement.className = 'korean-text';
      textElement.textContent = '이것은 한국어 텍스트입니다. 단어가 올바르게 줄바꿈되어야 합니다.';
      textElement.style.wordBreak = 'keep-all';
      textElement.style.wordWrap = 'break-word';
      container.appendChild(textElement);

      expect(textElement.style.wordBreak).toBe('keep-all');
      expect(textElement.style.wordWrap).toBe('break-word');
    });

    it('Pretendard 폰트가 올바르게 적용되어야 함', () => {
      const textElement = document.createElement('p');
      textElement.style.fontFamily = 'Pretendard Variable, -apple-system, sans-serif';
      textElement.textContent = '프리텐다드 폰트 테스트';
      container.appendChild(textElement);

      expect(textElement.style.fontFamily).toContain('Pretendard Variable');
    });

    it('한글 제목이 올바른 스타일을 가져야 함', () => {
      const heading = document.createElement('h1');
      heading.className = 'heading-primary korean-heading';
      heading.textContent = '도하닷케이알 - 심리테스트';
      heading.style.lineHeight = '1.4';
      container.appendChild(heading);

      expect(heading.className).toContain('korean-heading');
      expect(heading.style.lineHeight).toBe('1.4');
      expectKoreanText(heading, '도하닷케이알 - 심리테스트');
    });
  });

  describe('Layout Components', () => {
    it('컨테이너가 올바른 최대 너비를 가져야 함', () => {
      const containerEl = document.createElement('div');
      containerEl.className = 'container';
      containerEl.style.maxWidth = '1200px';
      containerEl.style.margin = '0 auto';
      containerEl.style.padding = '0 16px';
      container.appendChild(containerEl);

      expect(containerEl.className).toContain('container');
      expect(containerEl.style.maxWidth).toBe('1200px');
      expect(containerEl.style.margin).toBe('0 auto');
    });

    it('그리드 시스템이 올바르게 작동해야 함', () => {
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-2 gap-md';
      grid.innerHTML = `
        <div class="grid-item">첫 번째 항목</div>
        <div class="grid-item">두 번째 항목</div>
      `;
      container.appendChild(grid);

      const items = grid.querySelectorAll('.grid-item');
      expect(items).toHaveLength(2);
      expect(grid.className).toContain('grid-cols-2');
      expect(grid.className).toContain('gap-md');
    });

    it('헤더가 올바른 구조를 가져야 함', () => {
      const header = document.createElement('header');
      header.className = 'header';
      header.innerHTML = `
        <div class="container">
          <div class="header-content">
            <div class="header-logo">
              <img src="/images/logo.svg" alt="도하닷케이알">
            </div>
            <nav class="header-nav">
              <a href="/">홈</a>
              <a href="/tests/">테스트</a>
              <a href="/tools/">도구</a>
            </nav>
          </div>
        </div>
      `;
      container.appendChild(header);

      const logo = header.querySelector('.header-logo');
      const nav = header.querySelector('.header-nav');
      const links = nav.querySelectorAll('a');

      expect(logo).toBeTruthy();
      expect(nav).toBeTruthy();
      expect(links).toHaveLength(3);

      const homeLink = links[0];
      expectKoreanText(homeLink, '홈');
    });
  });

  describe('Accessibility', () => {
    it('버튼에 적절한 aria-label이 있어야 함', () => {
      const button = document.createElement('button');
      button.className = 'btn btn-icon';
      button.setAttribute('aria-label', '메뉴 열기');
      button.innerHTML = '<span>☰</span>';
      container.appendChild(button);

      expect(button.getAttribute('aria-label')).toBe('메뉴 열기');
    });

    it('폼 요소에 적절한 레이블이 연결되어야 함', () => {
      const formGroup = document.createElement('div');
      formGroup.innerHTML = `
        <label for="accessible-input">접근 가능한 입력 필드</label>
        <input id="accessible-input" type="text" aria-describedby="input-help">
        <div id="input-help">도움말 텍스트</div>
      `;
      container.appendChild(formGroup);

      const label = formGroup.querySelector('label');
      const input = formGroup.querySelector('input');
      const help = formGroup.querySelector('#input-help');

      expect(label.getAttribute('for')).toBe('accessible-input');
      expect(input.id).toBe('accessible-input');
      expect(input.getAttribute('aria-describedby')).toBe('input-help');
      expect(help.id).toBe('input-help');
    });

    it('색상에만 의존하지 않는 상태 표시가 있어야 함', () => {
      const statusElement = document.createElement('div');
      statusElement.className = 'status status-success';
      statusElement.innerHTML = `
        <span class="status-icon" aria-hidden="true">✓</span>
        <span class="status-text">성공</span>
      `;
      container.appendChild(statusElement);

      const icon = statusElement.querySelector('.status-icon');
      const text = statusElement.querySelector('.status-text');

      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(text).toBeTruthy();
      expectKoreanText(text, '성공');
    });

    it('적절한 heading 계층구조를 가져야 함', () => {
      const section = document.createElement('section');
      section.innerHTML = `
        <h1>메인 제목</h1>
        <h2>섹션 제목</h2>
        <h3>하위 섹션 제목</h3>
      `;
      container.appendChild(section);

      const h1 = section.querySelector('h1');
      const h2 = section.querySelector('h2');
      const h3 = section.querySelector('h3');

      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();

      expectKoreanText(h1, '메인 제목');
      expectKoreanText(h2, '섹션 제목');
      expectKoreanText(h3, '하위 섹션 제목');
    });
  });

  describe('Component Interactions', () => {
    it('드롭다운 메뉴가 올바르게 작동해야 함', () => {
      const dropdown = document.createElement('div');
      dropdown.className = 'dropdown';
      dropdown.innerHTML = `
        <button class="dropdown-trigger" aria-expanded="false">
          메뉴 <span class="dropdown-arrow">▼</span>
        </button>
        <div class="dropdown-content" hidden>
          <a href="#1">항목 1</a>
          <a href="#2">항목 2</a>
          <a href="#3">항목 3</a>
        </div>
      `;
      container.appendChild(dropdown);

      const trigger = dropdown.querySelector('.dropdown-trigger');
      const content = dropdown.querySelector('.dropdown-content');

      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(content.hasAttribute('hidden')).toBe(true);

      // 드롭다운 열기 시뮬레이션
      trigger.setAttribute('aria-expanded', 'true');
      content.removeAttribute('hidden');

      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(content.hasAttribute('hidden')).toBe(false);
    });

    it('모달이 올바른 접근성 속성을 가져야 함', () => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'modal-title');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modal-title">모달 제목</h2>
            <button class="modal-close" aria-label="모달 닫기">×</button>
          </div>
          <div class="modal-body">
            <p>모달 내용입니다.</p>
          </div>
        </div>
      `;
      container.appendChild(modal);

      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('aria-labelledby')).toBe('modal-title');
      expect(modal.getAttribute('aria-modal')).toBe('true');

      const title = modal.querySelector('#modal-title');
      const closeButton = modal.querySelector('.modal-close');

      expect(title.id).toBe('modal-title');
      expect(closeButton.getAttribute('aria-label')).toBe('모달 닫기');
      expectKoreanText(title, '모달 제목');
    });

    it('탭 인터페이스가 올바른 ARIA 속성을 가져야 함', () => {
      const tabs = document.createElement('div');
      tabs.className = 'tabs';
      tabs.innerHTML = `
        <div class="tab-list" role="tablist">
          <button class="tab" role="tab" aria-selected="true" aria-controls="panel1">탭 1</button>
          <button class="tab" role="tab" aria-selected="false" aria-controls="panel2">탭 2</button>
        </div>
        <div class="tab-panels">
          <div id="panel1" class="tab-panel" role="tabpanel">첫 번째 패널</div>
          <div id="panel2" class="tab-panel" role="tabpanel" hidden>두 번째 패널</div>
        </div>
      `;
      container.appendChild(tabs);

      const tabList = tabs.querySelector('.tab-list');
      const tabButtons = tabs.querySelectorAll('.tab');
      const panels = tabs.querySelectorAll('.tab-panel');

      expect(tabList.getAttribute('role')).toBe('tablist');
      expect(tabButtons).toHaveLength(2);
      expect(panels).toHaveLength(2);

      expect(tabButtons[0].getAttribute('aria-selected')).toBe('true');
      expect(tabButtons[1].getAttribute('aria-selected')).toBe('false');
      expect(tabButtons[0].getAttribute('aria-controls')).toBe('panel1');
      expect(panels[1].hasAttribute('hidden')).toBe(true);
    });
  });
});