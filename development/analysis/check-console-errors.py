from playwright.sync_api import sync_playwright
import os

def check_console_errors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # headless=False로 브라우저 표시
        page = browser.new_page()
        
        # 콘솔 메시지 캡처
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        
        # 로컬 파일 열기
        file_path = f"file:///{os.getcwd()}/index.html".replace("\\", "/")
        print(f"Opening: {file_path}")
        
        page.goto(file_path)
        page.wait_for_timeout(3000)
        
        # 콘솔 메시지 출력
        print("\n=== Console Messages ===")
        for msg in console_messages:
            print(msg)
        
        # CSS 파일 로드 확인
        css_loaded = page.evaluate("""
            () => {
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                return Array.from(links).map(link => ({
                    href: link.href,
                    loaded: link.sheet !== null
                }));
            }
        """)
        
        print("\n=== CSS Files ===")
        for css in css_loaded:
            print(f"- {css['href']}: {'Loaded' if css['loaded'] else 'Failed'}")
        
        # 네트워크 오류 확인
        failed_requests = []
        page.on("requestfailed", lambda request: failed_requests.append(request.url()))
        
        # 페이지 리로드
        page.reload()
        page.wait_for_timeout(2000)
        
        if failed_requests:
            print("\n=== Failed Requests ===")
            for url in failed_requests:
                print(f"- {url}")
        
        input("\n브라우저를 확인하세요. 엔터를 누르면 종료합니다...")
        browser.close()

if __name__ == "__main__":
    check_console_errors()