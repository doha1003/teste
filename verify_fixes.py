import asyncio
from playwright.async_api import async_playwright
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

async def verify_page(url):
    """Verify a single page has no errors"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        errors = []
        console_errors = []
        
        # Collect console errors
        page.on("console", lambda msg: console_errors.append(msg) if msg.type == "error" else None)
        
        # Collect failed requests
        page.on("requestfailed", lambda request: errors.append(f"Failed: {request.url}"))
        
        # Collect 404s
        page.on("response", lambda response: errors.append(f"404: {response.url}") if response.status == 404 else None)
        
        try:
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(2000)
            
            status = "✅ OK" if not errors and not console_errors else "❌ ERRORS"
            error_count = len(errors) + len(console_errors)
            
            return {
                "url": url,
                "status": status,
                "error_count": error_count,
                "errors": errors[:3],  # First 3 errors
                "console_errors": [msg.text for msg in console_errors[:3]]  # First 3 console errors
            }
            
        except Exception as e:
            return {
                "url": url,
                "status": "❌ FAILED",
                "error_count": 1,
                "errors": [str(e)],
                "console_errors": []
            }
        finally:
            await browser.close()

async def main():
    # Previously problematic pages
    pages_to_verify = [
        "https://doha.kr/tests/",
        "https://doha.kr/tools/",
        "https://doha.kr/fortune/daily/",
        "https://doha.kr/fortune/saju/",
        "https://doha.kr/faq/",
        "https://doha.kr/contact/"
    ]
    
    print("Verifying fixed pages...")
    print("="*60)
    
    for url in pages_to_verify:
        result = await verify_page(url)
        print(f"\n{result['url']}")
        print(f"Status: {result['status']}")
        if result['error_count'] > 0:
            print(f"Errors: {result['error_count']}")
            for error in result['errors']:
                print(f"  - {error}")
            for error in result['console_errors']:
                print(f"  - Console: {error}")
    
    print("\n" + "="*60)
    print("Verification complete!")

if __name__ == "__main__":
    asyncio.run(main())