from playwright.sync_api import sync_playwright
import time
import os

def capture_all_pages():
    """모든 26개 페이지를 라이트/다크 모드로 캡처"""
    
    # 모든 페이지 목록
    all_pages = [
        # 메인 페이지
        {"path": "/", "name": "index"},
        
        # 심리테스트 (tests)
        {"path": "/tests/mbti/test.html", "name": "tests_mbti"},
        {"path": "/tests/teto-egen/test.html", "name": "tests_teto_egen"},
        {"path": "/tests/love-dna/test.html", "name": "tests_love_dna"},
        {"path": "/tests/personality/test.html", "name": "tests_personality"},
        {"path": "/tests/love-style/test.html", "name": "tests_love_style"},
        {"path": "/tests/stress/test.html", "name": "tests_stress"},
        {"path": "/tests/emotional-iq/test.html", "name": "tests_emotional_iq"},
        {"path": "/tests/communication/test.html", "name": "tests_communication"},
        {"path": "/tests/relationship/test.html", "name": "tests_relationship"},
        
        # 실용도구 (tools)
        {"path": "/tools/text-counter.html", "name": "tools_text_counter"},
        {"path": "/tools/bmi-calculator.html", "name": "tools_bmi"},
        {"path": "/tools/salary-calculator.html", "name": "tools_salary"},
        {"path": "/tools/age-calculator.html", "name": "tools_age"},
        {"path": "/tools/date-calculator.html", "name": "tools_date"},
        {"path": "/tools/unit-converter.html", "name": "tools_unit"},
        
        # AI 운세 (fortune)
        {"path": "/fortune/saju/", "name": "fortune_saju"},
        {"path": "/fortune/daily/", "name": "fortune_daily"},
        {"path": "/fortune/tarot/", "name": "fortune_tarot"},
        {"path": "/fortune/zodiac/", "name": "fortune_zodiac"},
        {"path": "/fortune/zodiac-animal/", "name": "fortune_zodiac_animal"},
        
        # 기타 페이지
        {"path": "/about/", "name": "about"},
        {"path": "/contact/", "name": "contact"},
        {"path": "/privacy/", "name": "privacy"},
        {"path": "/terms/", "name": "terms"},
        {"path": "/sitemap/", "name": "sitemap"}
    ]
    
    # 스크린샷 디렉토리 생성
    os.makedirs("screenshots", exist_ok=True)
    
    print(f"총 {len(all_pages)}개 페이지 캡처 시작...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 데스크톱 뷰포트
        desktop_context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        desktop_page = desktop_context.new_page()
        
        # 모바일 뷰포트
        mobile_context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        mobile_page = mobile_context.new_page()
        
        base_url = "https://doha.kr"
        
        for i, page_info in enumerate(all_pages, 1):
            path = page_info['path']
            name = page_info['name']
            url = f"{base_url}{path}"
            
            print(f"\n[{i}/{len(all_pages)}] {path} 캡처 중...")
            
            try:
                # 데스크톱 - 라이트모드
                desktop_page.goto(url, wait_until='networkidle')
                desktop_page.wait_for_timeout(2000)
                desktop_page.screenshot(path=f"screenshots/{name}_desktop_light.png", full_page=True)
                print(f"  [OK] 데스크톱 라이트모드")
                
                # 데스크톱 - 다크모드
                try:
                    desktop_page.click('.dark-mode-toggle', timeout=3000)
                    desktop_page.wait_for_timeout(500)
                    desktop_page.screenshot(path=f"screenshots/{name}_desktop_dark.png", full_page=True)
                    print(f"  [OK] 데스크톱 다크모드")
                    
                    # 다시 라이트모드로
                    desktop_page.click('.dark-mode-toggle')
                    desktop_page.wait_for_timeout(500)
                except:
                    print(f"  [SKIP] 다크모드 토글 없음")
                
                # 모바일 - 라이트모드
                mobile_page.goto(url, wait_until='networkidle')
                mobile_page.wait_for_timeout(2000)
                mobile_page.screenshot(path=f"screenshots/{name}_mobile_light.png", full_page=True)
                print(f"  [OK] 모바일 라이트모드")
                
                # 모바일 - 다크모드
                try:
                    mobile_page.click('.dark-mode-toggle', timeout=3000)
                    mobile_page.wait_for_timeout(500)
                    mobile_page.screenshot(path=f"screenshots/{name}_mobile_dark.png", full_page=True)
                    print(f"  [OK] 모바일 다크모드")
                    
                    # 다시 라이트모드로
                    mobile_page.click('.dark-mode-toggle')
                    mobile_page.wait_for_timeout(500)
                except:
                    print(f"  [SKIP] 모바일 다크모드")
                
            except Exception as e:
                print(f"  [ERROR] {str(e)}")
                continue
        
        desktop_context.close()
        mobile_context.close()
        browser.close()
        
        print(f"\n모든 페이지 캡처 완료!")
        print(f"스크린샷 저장 위치: ./screenshots/")
        
        # 캡처된 파일 목록
        files = os.listdir("screenshots")
        print(f"\n총 {len(files)}개 스크린샷 생성됨:")
        for f in sorted(files)[:10]:
            print(f"  - {f}")
        if len(files) > 10:
            print(f"  ... 외 {len(files)-10}개")

if __name__ == "__main__":
    capture_all_pages()