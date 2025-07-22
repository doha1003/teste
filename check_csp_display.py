from playwright.sync_api import sync_playwright
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def check_visible_text():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # 메인 페이지 방문
        page.goto("https://doha.kr", wait_until='networkidle')
        page.wait_for_timeout(3000)
        
        # 문제의 텍스트가 화면에 표시되는지 확인
        csp_text = "self' https:; frame-src 'self'"
        
        # 페이지 전체 텍스트 내용 가져오기
        visible_text = page.inner_text('body')
        
        if csp_text in visible_text:
            print("❌ CSP 텍스트가 화면에 노출되고 있습니다!")
            
            # 어느 요소에서 노출되는지 찾기
            elements = page.query_selector_all('*')
            for element in elements:
                try:
                    text = element.inner_text()
                    if csp_text in text and len(text) < 1000:
                        tag_name = element.evaluate('el => el.tagName')
                        class_name = element.evaluate('el => el.className')
                        print(f"\n노출 위치: <{tag_name} class='{class_name}'>")
                        print(f"텍스트: {text[:200]}...")
                        
                        # 부모 요소 확인
                        parent = element.evaluate('el => el.parentElement ? el.parentElement.tagName : null')
                        if parent:
                            print(f"부모 요소: <{parent}>")
                        break
                except:
                    continue
                    
            # 스크린샷 캡처
            page.screenshot(path="csp_display_issue.png", full_page=False)
            print("\n스크린샷 저장: csp_display_issue.png")
            
            # HTML 소스 확인
            html_source = page.content()
            if "self' https:; frame-src 'self'" in html_source:
                # HTML에서 문제 부분 찾기
                lines = html_source.split('\n')
                for i, line in enumerate(lines):
                    if "self' https:; frame-src 'self'" in line and not '<meta' in line:
                        print(f"\nHTML 소스에서 발견 (라인 {i+1}):")
                        print(f"{lines[i-1] if i > 0 else ''}")
                        print(f">>> {line[:200]}")
                        print(f"{lines[i+1] if i < len(lines)-1 else ''}")
                        break
        else:
            print("✅ CSP 텍스트가 화면에 노출되지 않습니다.")
            
        browser.close()

if __name__ == "__main__":
    check_visible_text()