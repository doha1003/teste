import asyncio
from playwright.async_api import async_playwright
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

async def urgent_check():
    """Urgent check for navigation and footer visibility"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        # Check main page
        print("🚨 긴급 점검: https://doha.kr")
        await page.goto("https://doha.kr", wait_until='networkidle')
        await page.wait_for_timeout(3000)
        
        # Check for navbar
        navbar_visible = await page.evaluate('''() => {
            const navbar = document.querySelector('.navbar, nav, #navbar, #navbar-placeholder');
            if (!navbar) return {exists: false, visible: false};
            
            const style = window.getComputedStyle(navbar);
            return {
                exists: true,
                visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
                innerHTML: navbar.innerHTML.length,
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity
            };
        }''')
        
        # Check for footer
        footer_visible = await page.evaluate('''() => {
            const footer = document.querySelector('footer, .footer, #footer, #footer-placeholder');
            if (!footer) return {exists: false, visible: false};
            
            const style = window.getComputedStyle(footer);
            return {
                exists: true,
                visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
                innerHTML: footer.innerHTML.length,
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity
            };
        }''')
        
        # Check for JavaScript errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        await page.wait_for_timeout(2000)
        
        print(f"\n📱 네비게이션 상태:")
        print(f"  존재: {navbar_visible['exists']}")
        print(f"  보임: {navbar_visible.get('visible', False)}")
        if navbar_visible['exists']:
            print(f"  내용 길이: {navbar_visible['innerHTML']}")
            print(f"  CSS - display: {navbar_visible['display']}, visibility: {navbar_visible['visibility']}, opacity: {navbar_visible['opacity']}")
        
        print(f"\n🦶 푸터 상태:")
        print(f"  존재: {footer_visible['exists']}")
        print(f"  보임: {footer_visible.get('visible', False)}")
        if footer_visible['exists']:
            print(f"  내용 길이: {footer_visible['innerHTML']}")
            print(f"  CSS - display: {footer_visible['display']}, visibility: {footer_visible['visibility']}, opacity: {footer_visible['opacity']}")
        
        if console_errors:
            print(f"\n❌ JavaScript 오류들:")
            for error in console_errors[:5]:
                print(f"  - {error}")
        
        # Check if main.js is loading
        main_js_status = await page.evaluate('''() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const mainJs = scripts.find(s => s.src.includes('main.js'));
            return {
                exists: !!mainJs,
                src: mainJs ? mainJs.src : null,
                loaded: mainJs ? !mainJs.onerror : false
            };
        }''')
        
        print(f"\n📜 main.js 상태:")
        print(f"  스크립트 태그 존재: {main_js_status['exists']}")
        print(f"  소스: {main_js_status['src']}")
        print(f"  로드됨: {main_js_status['loaded']}")
        
        # Take screenshot
        await page.screenshot(path="urgent_check_screenshot.png", full_page=True)
        print(f"\n📸 스크린샷 저장: urgent_check_screenshot.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(urgent_check())