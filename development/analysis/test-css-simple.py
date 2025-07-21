from playwright.sync_api import sync_playwright
import time

def test_css_system():
    print("GitHub Pages 배포 대기 중... (2분)")
    time.sleep(120)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 메인 페이지 테스트
        print("\n메인페이지 테스트 중...")
        page.goto("https://doha.kr", wait_until='networkidle')
        page.wait_for_timeout(3000)
        
        # CSS 로드 확인
        css_status = page.evaluate("""
            () => {
                const mainCSS = document.querySelector('link[href*="main.css"]');
                const hasCustomProps = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() !== '';
                const darkToggle = document.querySelector('.dark-mode-toggle');
                
                return {
                    cssLoaded: mainCSS && mainCSS.sheet !== null,
                    customProps: hasCustomProps,
                    darkToggle: !!darkToggle,
                    bodyClass: document.body.className
                };
            }
        """)
        
        print(f"CSS 로드됨: {css_status['cssLoaded']}")
        print(f"CSS 변수 적용: {css_status['customProps']}")
        print(f"다크모드 버튼: {css_status['darkToggle']}")
        print(f"Body 클래스: {css_status['bodyClass']}")
        
        # 스크린샷
        page.screenshot(path="test_main_new_css.png")
        
        # 다크모드 테스트
        if css_status['darkToggle']:
            print("\n다크모드 테스트 중...")
            page.click('.dark-mode-toggle')
            page.wait_for_timeout(1000)
            
            dark_applied = page.evaluate("""
                () => document.documentElement.getAttribute('data-theme') === 'dark'
            """)
            
            print(f"다크모드 적용: {dark_applied}")
            page.screenshot(path="test_main_dark_css.png")
        
        browser.close()
        print("\n테스트 완료!")

if __name__ == "__main__":
    test_css_system()