from playwright.sync_api import sync_playwright
import time

def verify_css_fix():
    """CSS 수정이 제대로 적용되었는지 확인"""
    
    print("GitHub Pages 배포 대기 중... (2분)")
    time.sleep(120)  # 2분 대기
    
    # 확인할 페이지들
    pages_to_check = [
        {"path": "/tests/mbti/test.html", "name": "MBTI 테스트"},
        {"path": "/tools/text-counter.html", "name": "글자수 세기"},
        {"path": "/fortune/tarot/", "name": "AI 타로"},
        {"path": "/tools/salary-calculator.html", "name": "연봉계산기"},
        {"path": "/fortune/daily/", "name": "오늘의 운세"}
    ]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        base_url = "https://doha.kr"
        
        for page_info in pages_to_check:
            path = page_info['path']
            name = page_info['name']
            url = f"{base_url}{path}"
            
            print(f"\n{name} 페이지 확인 중...")
            page.goto(url, wait_until='networkidle')
            page.wait_for_timeout(2000)
            
            # CSS 로드 확인
            css_loaded = page.evaluate("""
                () => {
                    const link = document.querySelector('link[href="/css/styles.css"]');
                    if (!link) return "CSS 링크 없음";
                    
                    // 배경색 확인으로 CSS 적용 여부 체크
                    const body = document.body;
                    const bgColor = window.getComputedStyle(body).backgroundColor;
                    const hasStyles = bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
                    
                    return hasStyles ? "CSS 적용됨" : "CSS 미적용";
                }
            """)
            
            print(f"  상태: {css_loaded}")
            
            # 스크린샷 저장
            filename = f"verify_{path.replace('/', '_').replace('.html', '')}.png"
            page.screenshot(path=filename)
            print(f"  스크린샷: {filename}")
        
        browser.close()
        print("\n검증 완료!")

if __name__ == "__main__":
    verify_css_fix()