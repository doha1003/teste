import asyncio
from playwright.async_api import async_playwright
import xml.etree.ElementTree as ET
import json
from datetime import datetime
import os
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

async def check_page(page, url):
    """Check a single page for errors"""
    results = {
        "url": url,
        "status": "OK",
        "errors": [],
        "warnings": [],
        "console_errors": [],
        "network_errors": [],
        "missing_resources": []
    }
    
    # Collect console messages
    console_logs = []
    page.on("console", lambda msg: console_logs.append({
        "type": msg.type, 
        "text": msg.text
    }))
    
    # Collect network errors
    failed_requests = []
    page.on("requestfailed", lambda request: failed_requests.append({
        "url": request.url,
        "failure": request.failure
    }))
    
    try:
        # Navigate to page
        response = await page.goto(url, wait_until='networkidle', timeout=30000)
        
        # Check HTTP status
        if response.status >= 400:
            results["status"] = "ERROR"
            results["errors"].append(f"HTTP {response.status} error")
        
        # Wait for content to load
        await page.wait_for_timeout(2000)
        
        # Check for console errors
        for log in console_logs:
            if log["type"] in ["error", "warning"]:
                results["console_errors"].append(log)
                if log["type"] == "error":
                    results["status"] = "ERROR"
        
        # Check for network errors
        for failed in failed_requests:
            results["network_errors"].append(failed)
            results["status"] = "ERROR"
        
        # Check for missing CSS/JS files
        missing_resources = await page.evaluate('''() => {
            const errors = [];
            
            // Check CSS files
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(link => {
                if (!link.sheet) {
                    errors.push({
                        type: 'CSS',
                        url: link.href,
                        message: 'Failed to load stylesheet'
                    });
                }
            });
            
            // Check for inline errors
            const errorElements = document.querySelectorAll('.error, .error-message');
            errorElements.forEach(el => {
                errors.push({
                    type: 'DOM',
                    message: el.textContent.trim()
                });
            });
            
            return errors;
        }''')
        
        if missing_resources:
            results["missing_resources"] = missing_resources
            results["status"] = "ERROR"
        
        # Check for common issues
        common_issues = await page.evaluate('''() => {
            const issues = [];
            
            // Check for broken images
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (!img.complete || img.naturalWidth === 0) {
                    issues.push({
                        type: 'broken_image',
                        src: img.src
                    });
                }
            });
            
            // Check for empty content areas
            const mainContent = document.querySelector('main, .content, #content');
            if (mainContent && mainContent.textContent.trim().length < 50) {
                issues.push({
                    type: 'empty_content',
                    message: 'Main content area appears empty'
                });
            }
            
            return issues;
        }''')
        
        if common_issues:
            results["warnings"].extend(common_issues)
            
    except Exception as e:
        results["status"] = "ERROR"
        results["errors"].append(f"Page load error: {str(e)}")
    
    return results

async def check_all_pages():
    """Check all pages from sitemap"""
    # Parse sitemap
    tree = ET.parse('sitemap.xml')
    root = tree.getroot()
    namespace = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    urls = []
    for url_element in root.findall('sitemap:url', namespace):
        loc = url_element.find('sitemap:loc', namespace)
        if loc is not None:
            urls.append(loc.text)
    
    print(f"Found {len(urls)} pages to check\n")
    
    # Check pages
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        
        all_results = []
        error_count = 0
        
        for i, url in enumerate(urls, 1):
            print(f"[{i}/{len(urls)}] Checking: {url}")
            page = await context.new_page()
            
            try:
                result = await check_page(page, url)
                all_results.append(result)
                
                if result["status"] == "ERROR":
                    error_count += 1
                    print(f"  ❌ ERROR: {', '.join(result['errors'][:2])}")
                    if result["console_errors"]:
                        print(f"     Console errors: {len(result['console_errors'])}")
                    if result["network_errors"]:
                        print(f"     Network errors: {len(result['network_errors'])}")
                else:
                    print(f"  ✅ OK")
                    
            except Exception as e:
                print(f"  ❌ CRITICAL ERROR: {str(e)}")
                all_results.append({
                    "url": url,
                    "status": "CRITICAL",
                    "errors": [str(e)]
                })
                error_count += 1
            
            await page.close()
        
        await browser.close()
    
    # Generate report
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"page_check_report_{timestamp}.json"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": timestamp,
            "total_pages": len(urls),
            "error_count": error_count,
            "success_count": len(urls) - error_count,
            "results": all_results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"Check completed!")
    print(f"Total pages: {len(urls)}")
    print(f"Errors found: {error_count}")
    print(f"Success: {len(urls) - error_count}")
    print(f"Report saved to: {report_path}")
    
    # Show error summary
    if error_count > 0:
        print(f"\n{'='*60}")
        print("ERROR SUMMARY:")
        for result in all_results:
            if result["status"] == "ERROR":
                print(f"\n{result['url']}:")
                for error in result["errors"][:3]:
                    print(f"  - {error}")
                if result["console_errors"]:
                    print(f"  - {len(result['console_errors'])} console errors")
                if result["missing_resources"]:
                    print(f"  - {len(result['missing_resources'])} missing resources")

if __name__ == "__main__":
    asyncio.run(check_all_pages())