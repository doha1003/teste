import asyncio
from playwright.async_api import async_playwright
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

async def debug_loading():
    """Debug the loading process in detail"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        # Collect all console messages
        console_messages = []
        def on_console(msg):
            console_messages.append({
                "type": msg.type,
                "text": msg.text,
                "location": msg.location if hasattr(msg, 'location') else None
            })
        page.on("console", on_console)
        
        # Collect network failures
        failed_requests = []
        def on_request_failed(request):
            failed_requests.append({
                "url": request.url,
                "failure": request.failure
            })
        page.on("requestfailed", on_request_failed)
        
        print("🔍 Loading https://doha.kr with detailed debugging...")
        await page.goto("https://doha.kr", wait_until='networkidle')
        
        # Wait a bit more for async loading
        await page.wait_for_timeout(5000)
        
        # Check what's actually loaded
        script_info = await page.evaluate('''() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.map(s => ({
                src: s.src,
                loaded: !s.onerror && s.readyState !== 'loading'
            }));
        }''')
        
        # Check component loading
        component_status = await page.evaluate('''() => {
            return {
                navbarPlaceholder: {
                    exists: !!document.getElementById('navbar-placeholder'),
                    innerHTML: document.getElementById('navbar-placeholder')?.innerHTML.length || 0,
                    content: document.getElementById('navbar-placeholder')?.innerHTML.substring(0, 100) || ''
                },
                footerPlaceholder: {
                    exists: !!document.getElementById('footer-placeholder'),
                    innerHTML: document.getElementById('footer-placeholder')?.innerHTML.length || 0,
                    content: document.getElementById('footer-placeholder')?.innerHTML.substring(0, 100) || ''
                },
                loadComponentById: typeof window.loadComponentById,
                loadComponents: typeof window.loadComponents
            };
        }''')
        
        print("\n📜 스크립트 로딩 상태:")
        for script in script_info:
            print(f"  {script['src']} - {'✅' if script['loaded'] else '❌'}")
        
        print("\n📱 컴포넌트 상태:")
        print(f"  navbar-placeholder 존재: {component_status['navbarPlaceholder']['exists']}")
        print(f"  navbar 내용 길이: {component_status['navbarPlaceholder']['innerHTML']}")
        print(f"  navbar 내용 미리보기: {component_status['navbarPlaceholder']['content']}")
        print(f"  footer-placeholder 존재: {component_status['footerPlaceholder']['exists']}")  
        print(f"  footer 내용 길이: {component_status['footerPlaceholder']['innerHTML']}")
        print(f"  footer 내용 미리보기: {component_status['footerPlaceholder']['content']}")
        
        print(f"\n🔧 함수 상태:")
        print(f"  loadComponentById: {component_status['loadComponentById']}")
        print(f"  loadComponents: {component_status['loadComponents']}")
        
        if console_messages:
            print(f"\n📋 콘솔 메시지 ({len(console_messages)}개):")
            for msg in console_messages[:10]:
                print(f"  [{msg['type'].upper()}] {msg['text']}")
        
        if failed_requests:
            print(f"\n❌ 실패한 요청들:")
            for req in failed_requests:
                print(f"  {req['url']} - {req['failure']}")
        
        # Manually try to load components
        print(f"\n🔧 수동으로 컴포넌트 로딩 시도...")
        manual_load_result = await page.evaluate('''async () => {
            try {
                const navResponse = await fetch('/includes/navbar.html');
                const navText = await navResponse.text();
                const navTarget = document.getElementById('navbar-placeholder');
                if (navTarget) {
                    navTarget.innerHTML = navText;
                }
                
                const footerResponse = await fetch('/includes/footer.html');
                const footerText = await footerResponse.text();
                const footerTarget = document.getElementById('footer-placeholder');
                if (footerTarget) {
                    footerTarget.innerHTML = footerText;
                }
                
                return {
                    success: true,
                    navLength: navText.length,
                    footerLength: footerText.length
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }''')
        
        print(f"수동 로딩 결과: {manual_load_result}")
        
        await page.screenshot(path="debug_after_manual_load.png", full_page=True)
        print(f"\n📸 스크린샷 저장: debug_after_manual_load.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_loading())