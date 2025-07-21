from playwright.sync_api import sync_playwright
import time

def test_new_css_system():
    """새로운 모듈식 CSS 시스템 테스트"""
    
    print("GitHub Pages 배포 대기 중... (2분)")
    time.sleep(120)  # 2분 대기
    
    test_pages = [
        {"url": "https://doha.kr", "name": "메인페이지", "expected_class": "page-home"},
        {"url": "https://doha.kr/tests/mbti/test.html", "name": "MBTI 테스트", "expected_class": "page-tests"},
        {"url": "https://doha.kr/tools/text-counter.html", "name": "글자수 세기", "expected_class": "page-tools"},
        {"url": "https://doha.kr/fortune/tarot/", "name": "AI 타로", "expected_class": "page-fortune"},
        {"url": "https://doha.kr/about/", "name": "소개페이지", "expected_class": "page-etc"}
    ]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        results = []
        
        for test_page in test_pages:
            print(f"\n=== {test_page['name']} 테스트 ===")
            
            try:
                page.goto(test_page['url'], wait_until='networkidle')
                page.wait_for_timeout(3000)
                
                # CSS 로드 확인
                css_check = page.evaluate("""
                    () => {
                        // main.css 로드 확인
                        const mainCSS = document.querySelector('link[href*="main.css"]');
                        const mainCSSLoaded = mainCSS && mainCSS.sheet !== null;
                        
                        // 스타일 적용 확인
                        const body = document.body;
                        const computedStyle = window.getComputedStyle(body);
                        const hasCustomProps = computedStyle.getPropertyValue('--brand-primary').trim() !== '';
                        
                        // 다크모드 토글 버튼 확인
                        const darkModeToggle = document.querySelector('.dark-mode-toggle');
                        
                        // CSS 로더 스크립트 확인
                        const cssLoader = typeof window.cssLoader !== 'undefined';
                        
                        // 다크모드 매니저 확인
                        const darkModeManager = typeof window.darkModeManager !== 'undefined';
                        
                        return {
                            mainCSSLoaded,
                            hasCustomProps,
                            darkModeToggle: !!darkModeToggle,
                            cssLoader,
                            darkModeManager,
                            bodyClass: body.className,
                            bgColor: computedStyle.backgroundColor
                        };
                    }
                """)
                
                # 다크모드 토글 테스트
                dark_mode_test = False
                try:
                    # 다크모드 토글 클릭
                    page.click('.dark-mode-toggle', timeout=5000)
                    page.wait_for_timeout(1000)
                    
                    # 다크모드 적용 확인
                    is_dark = page.evaluate("""
                        () => {
                            const root = document.documentElement;
                            return root.getAttribute('data-theme') === 'dark';
                        }
                    """)
                    
                    dark_mode_test = is_dark
                    
                    # 다시 라이트모드로
                    page.click('.dark-mode-toggle')
                    page.wait_for_timeout(500)
                    
                except:
                    pass
                
                # 스크린샷 캡처
                page.screenshot(path=f"test_{test_page['name'].replace(' ', '_')}_new_system.png")
                
                result = {
                    'page': test_page['name'],
                    'url': test_page['url'],
                    'success': css_check['mainCSSLoaded'] and css_check['hasCustomProps'],
                    'css_loaded': css_check['mainCSSLoaded'],
                    'custom_props': css_check['hasCustomProps'],
                    'dark_toggle': css_check['darkModeToggle'],
                    'css_loader': css_check['cssLoader'],
                    'dark_manager': css_check['darkModeManager'],
                    'dark_mode_works': dark_mode_test,
                    'body_class': css_check['bodyClass']
                }
                
                results.append(result)
                
                # 결과 출력
                status = "✅ 성공" if result['success'] else "❌ 실패"
                print(f"결과: {status}")
                print(f"  - CSS 로드: {'✅' if result['css_loaded'] else '❌'}")
                print(f"  - CSS 변수: {'✅' if result['custom_props'] else '❌'}")
                print(f"  - 다크모드 버튼: {'✅' if result['dark_toggle'] else '❌'}")
                print(f"  - CSS 로더: {'✅' if result['css_loader'] else '❌'}")
                print(f"  - 다크모드 매니저: {'✅' if result['dark_manager'] else '❌'}")
                print(f"  - 다크모드 동작: {'✅' if result['dark_mode_works'] else '❌'}")
                print(f"  - Body 클래스: {result['body_class']}")
                
            except Exception as e:
                print(f"오류 발생: {str(e)}")
                results.append({
                    'page': test_page['name'],
                    'success': False,
                    'error': str(e)
                })
        
        browser.close()
        
        # 전체 결과 요약
        print("\n" + "="*50)
        print("🎯 새로운 CSS 시스템 테스트 결과")
        print("="*50)
        
        successful_pages = [r for r in results if r.get('success', False)]
        total_pages = len(results)
        
        print(f"성공: {len(successful_pages)}/{total_pages}")
        
        if len(successful_pages) == total_pages:
            print("🎉 모든 페이지에서 새로운 CSS 시스템이 정상 작동합니다!")
        else:
            print("⚠️  일부 페이지에서 문제가 발견되었습니다.")
            
        for result in results:
            if not result.get('success', False):
                print(f"❌ {result['page']}: {result.get('error', '알 수 없는 오류')}")
        
        return successful_pages, results

if __name__ == "__main__":
    test_new_css_system()