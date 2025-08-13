/**
 * Legal Pages JavaScript
 * 법적 페이지 (이용약관, 개인정보처리방침) 기능
 */

class LegalPage {
  constructor() {
    this.toc = null;
    this.sections = [];
    this.activeSection = null;
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }

  onDOMReady() {
    this.initTableOfContents();
    this.initScrollSpy();
    this.initSmoothScroll();
  }

  /**
   * 목차 초기화
   */
  initTableOfContents() {
    this.toc = document.querySelector('.legal-toc');
    if (!this.toc) {return;}

    // 목차 링크들 가져오기
    const tocLinks = this.toc.querySelectorAll('a[href^="#"]');
    
    tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          this.scrollToSection(targetSection);
        }
      });
    });
  }

  /**
   * 스크롤 스파이 초기화
   */
  initScrollSpy() {
    // 모든 섹션 가져오기
    this.sections = document.querySelectorAll('.legal-section[id]');
    if (this.sections.length === 0) {return;}

    // Intersection Observer 설정
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // 모든 섹션 관찰
    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  /**
   * 활성 섹션 설정
   */
  setActiveSection(sectionId) {
    if (!this.toc) {return;}

    // 이전 활성 링크 제거
    const previousActive = this.toc.querySelector('.active');
    if (previousActive) {
      previousActive.classList.remove('active');
    }

    // 새 활성 링크 추가
    const newActive = this.toc.querySelector(`a[href="#${sectionId}"]`);
    if (newActive) {
      newActive.classList.add('active');
      this.activeSection = sectionId;
    }
  }

  /**
   * 부드러운 스크롤 초기화
   */
  initSmoothScroll() {
    // 모든 앵커 링크에 부드러운 스크롤 적용
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            this.scrollToSection(targetElement);
          }
        }
      });
    });
  }

  /**
   * 섹션으로 스크롤
   */
  scrollToSection(element) {
    const headerHeight = 80; // 헤더 높이
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// 페이지 인스턴스 생성
const legalPage = new LegalPage();

// 전역 노출 (필요한 경우)
window.legalPage = legalPage;

export default legalPage;