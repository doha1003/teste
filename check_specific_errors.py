import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

async def check_page_details(url):
    """Check specific page for detailed error information"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # headless=False to see what's happening
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        # Collect all console messages
        console_logs = []
        page.on("console", lambda msg: console_logs.append({
            "type": msg.type,
            "text": msg.text,
            "location": msg.location
        }))
        
        # Collect failed requests
        failed_requests = []
        def on_request_failed(request):
            failed_requests.append({
                "url": request.url,
                "method": request.method,
                "failure": request.failure
            })
        page.on("requestfailed", on_request_failed)
        
        # Collect all responses
        responses = []
        def on_response(response):
            if response.status >= 400:
                responses.append({
                    "url": response.url,
                    "status": response.status,
                    "status_text": response.status_text
                })
        page.on("response", on_response)
        
        print(f"Checking: {url}")
        print("="*60)
        
        try:
            response = await page.goto(url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Print failed resources
            if responses:
                print("\n❌ Failed Resources (404/500 errors):")
                for resp in responses:
                    print(f"  - {resp['status']} {resp['url']}")
            
            # Print console errors
            error_logs = [log for log in console_logs if log['type'] in ['error', 'warning']]
            if error_logs:
                print("\n⚠️ Console Errors/Warnings:")
                for log in error_logs:
                    print(f"  - [{log['type'].upper()}] {log['text']}")
                    if log['location']:
                        print(f"    Location: {log['location']}")
            
            # Check specific elements
            print("\n📋 Page Analysis:")
            
            # Check for missing scripts
            missing_scripts = await page.evaluate('''() => {
                const scripts = document.querySelectorAll('script[src]');
                const missing = [];
                scripts.forEach(script => {
                    // Check if script failed to load
                    if (!script.innerHTML && script.src.includes('doha.kr')) {
                        missing.push(script.src);
                    }
                });
                return missing;
            }''')
            
            if missing_scripts:
                print("  Missing Scripts:")
                for script in missing_scripts:
                    print(f"    - {script}")
            
            # Check for missing CSS
            missing_css = await page.evaluate('''() => {
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                const missing = [];
                links.forEach(link => {
                    if (!link.sheet) {
                        missing.push(link.href);
                    }
                });
                return missing;
            }''')
            
            if missing_css:
                print("  Missing CSS:")
                for css in missing_css:
                    print(f"    - {css}")
                    
            # Take screenshot
            screenshot_name = f"error_{url.replace('https://doha.kr/', '').replace('/', '_')}.png"
            await page.screenshot(path=screenshot_name, full_page=True)
            print(f"\n📸 Screenshot saved: {screenshot_name}")
            
        except Exception as e:
            print(f"\n❌ Critical Error: {str(e)}")
        
        await browser.close()

async def main():
    # Check problematic pages
    problematic_pages = [
        "https://doha.kr/tests/",
        "https://doha.kr/tools/", 
        "https://doha.kr/fortune/daily/",
        "https://doha.kr/fortune/saju/",
        "https://doha.kr/faq/",
        "https://doha.kr/contact/"
    ]
    
    for url in problematic_pages:
        await check_page_details(url)
        print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(main())