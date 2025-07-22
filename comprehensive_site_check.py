import asyncio
from playwright.async_api import async_playwright
import xml.etree.ElementTree as ET
import json
from datetime import datetime
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

class ComprehensiveSiteChecker:
    def __init__(self):
        self.base_url = "https://doha.kr"
        self.issues = {
            "input_fields": [],
            "css_404": [],
            "js_404": [],
            "js_errors": [],
            "form_issues": [],
            "ui_broken": []
        }
        
    async def check_page(self, browser, url):
        """Check a single page for various issues"""
        page = await browser.new_page()
        page_issues = {
            "url": url,
            "input_problems": [],
            "missing_css": [],
            "missing_js": [],
            "console_errors": [],
            "form_problems": [],
            "ui_issues": []
        }
        
        # Collect console messages
        console_logs = []
        page.on("console", lambda msg: console_logs.append({
            "type": msg.type,
            "text": msg.text
        }))
        
        # Collect failed resources
        failed_resources = []
        page.on("response", lambda response: failed_resources.append({
            "url": response.url,
            "status": response.status
        }) if response.status >= 400 else None)
        
        try:
            print(f"\n🔍 Checking: {url}")
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(2000)
            
            # 1. Check input fields
            input_issues = await page.evaluate('''() => {
                const issues = [];
                const inputs = document.querySelectorAll('input, textarea, select');
                
                inputs.forEach(input => {
                    // Check if input is disabled or readonly when it shouldn't be
                    if (input.disabled && !input.dataset.intentionallyDisabled) {
                        issues.push({
                            type: 'disabled',
                            tag: input.tagName,
                            id: input.id || 'no-id',
                            class: input.className,
                            name: input.name || 'no-name'
                        });
                    }
                    
                    // Check if input has proper event listeners
                    if (input.type === 'text' || input.type === 'textarea') {
                        // Try to simulate input
                        const hasListeners = input.oninput || input.onchange || 
                                           input.getAttribute('oninput') || 
                                           input.getAttribute('onchange');
                        
                        if (!hasListeners && !input.closest('form')) {
                            issues.push({
                                type: 'no-listeners',
                                tag: input.tagName,
                                id: input.id || 'no-id',
                                class: input.className
                            });
                        }
                    }
                    
                    // Check if input is visually hidden but should be visible
                    const style = window.getComputedStyle(input);
                    if (style.display === 'none' || style.visibility === 'hidden' || 
                        parseFloat(style.opacity) === 0) {
                        if (!input.type.includes('hidden') && !input.dataset.intentionallyHidden) {
                            issues.push({
                                type: 'hidden',
                                tag: input.tagName,
                                id: input.id || 'no-id',
                                reason: `display: ${style.display}, visibility: ${style.visibility}, opacity: ${style.opacity}`
                            });
                        }
                    }
                });
                
                return issues;
            }''')
            
            if len(input_issues) > 0:
                page_issues["input_problems"] = input_issues
            
            # 2. Check CSS loading
            css_issues = await page.evaluate('''() => {
                const issues = [];
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                
                links.forEach(link => {
                    if (!link.sheet) {
                        issues.push({
                            href: link.href,
                            error: 'Failed to load'
                        });
                    }
                });
                
                // Check for missing styles on key elements
                const keyElements = [
                    '.navbar', '.hero', '.container', '.btn', 
                    '.service-card', '.form-control', '.section-title'
                ];
                
                keyElements.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        const styles = window.getComputedStyle(el);
                        // Check if element has basic styling
                        if (styles.width === 'auto' && styles.height === 'auto' && 
                            styles.padding === '0px' && styles.margin === '0px' &&
                            !el.style.cssText) {
                            issues.push({
                                selector: selector,
                                element: el.tagName + (el.id ? '#' + el.id : ''),
                                warning: 'Element appears unstyled'
                            });
                        }
                    });
                });
                
                return issues;
            }''')
            
            if len(css_issues) > 0:
                page_issues["ui_issues"] = css_issues
            
            # 3. Check forms functionality
            form_issues = await page.evaluate('''() => {
                const issues = [];
                const forms = document.querySelectorAll('form');
                
                forms.forEach((form, index) => {
                    // Check if form has submit handler
                    if (!form.onsubmit && !form.getAttribute('onsubmit') && 
                        !form.action && !form.dataset.ajaxForm) {
                        issues.push({
                            formIndex: index,
                            id: form.id || 'no-id',
                            issue: 'No submit handler or action'
                        });
                    }
                    
                    // Check if form has inputs
                    const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
                    if (inputs.length === 0) {
                        issues.push({
                            formIndex: index,
                            id: form.id || 'no-id',
                            issue: 'Form has no visible inputs'
                        });
                    }
                });
                
                return issues;
            }''')
            
            if len(form_issues) > 0:
                page_issues["form_problems"] = form_issues
            
            # 4. Check failed resources
            for resource in failed_resources:
                if resource["url"].endswith('.css'):
                    page_issues["missing_css"].append(resource["url"])
                elif resource["url"].endswith('.js'):
                    page_issues["missing_js"].append(resource["url"])
            
            # 5. Check console errors
            js_errors = [log for log in console_logs if log["type"] == "error"]
            if js_errors:
                page_issues["console_errors"] = js_errors
            
            # Print summary for this page
            total_issues = sum(len(v) for k, v in page_issues.items() if k != "url" and isinstance(v, list))
            if total_issues > 0:
                print(f"   ❌ Found {total_issues} issues")
                if page_issues["input_problems"]:
                    print(f"      - {len(page_issues['input_problems'])} input field problems")
                if page_issues["missing_css"]:
                    print(f"      - {len(page_issues['missing_css'])} CSS files not loading")
                if page_issues["missing_js"]:
                    print(f"      - {len(page_issues['missing_js'])} JS files not loading")
                if page_issues["console_errors"]:
                    print(f"      - {len(page_issues['console_errors'])} JavaScript errors")
                if page_issues["form_problems"]:
                    print(f"      - {len(page_issues['form_problems'])} form issues")
                if page_issues["ui_issues"]:
                    print(f"      - {len(page_issues['ui_issues'])} UI/styling issues")
            else:
                print(f"   ✅ No issues found")
            
            return page_issues
            
        except Exception as e:
            print(f"   ❌ Error checking page: {str(e)}")
            page_issues["error"] = str(e)
            return page_issues
        finally:
            await page.close()
    
    async def run_comprehensive_check(self):
        """Run comprehensive check on all pages"""
        # Get all URLs from sitemap
        tree = ET.parse('sitemap.xml')
        root = tree.getroot()
        namespace = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        urls = []
        for url_element in root.findall('sitemap:url', namespace):
            loc = url_element.find('sitemap:loc', namespace)
            if loc is not None:
                urls.append(loc.text)
        
        print(f"🚀 Starting comprehensive site check for {len(urls)} pages...")
        print("="*60)
        
        all_issues = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080}
            )
            
            for url in urls:
                issues = await self.check_page(browser, url)
                all_issues.append(issues)
            
            await browser.close()
        
        # Generate report
        self.generate_report(all_issues)
        
        return all_issues
    
    def generate_report(self, all_issues):
        """Generate a detailed report of all issues"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = f"comprehensive_site_report_{timestamp}.json"
        
        # Count total issues by type
        summary = {
            "total_pages": len(all_issues),
            "pages_with_issues": 0,
            "total_input_problems": 0,
            "total_css_missing": 0,
            "total_js_missing": 0,
            "total_js_errors": 0,
            "total_form_issues": 0,
            "total_ui_issues": 0,
            "pages_with_input_problems": [],
            "pages_with_css_problems": [],
            "pages_with_js_problems": [],
            "all_missing_files": set()
        }
        
        for page in all_issues:
            has_issues = False
            
            if page.get("input_problems"):
                summary["total_input_problems"] += len(page["input_problems"])
                summary["pages_with_input_problems"].append(page["url"])
                has_issues = True
                
            if page.get("missing_css"):
                summary["total_css_missing"] += len(page["missing_css"])
                summary["pages_with_css_problems"].append(page["url"])
                for css in page["missing_css"]:
                    summary["all_missing_files"].add(css)
                has_issues = True
                
            if page.get("missing_js"):
                summary["total_js_missing"] += len(page["missing_js"])
                summary["pages_with_js_problems"].append(page["url"])
                for js in page["missing_js"]:
                    summary["all_missing_files"].add(js)
                has_issues = True
                
            if page.get("console_errors"):
                summary["total_js_errors"] += len(page["console_errors"])
                has_issues = True
                
            if page.get("form_problems"):
                summary["total_form_issues"] += len(page["form_problems"])
                has_issues = True
                
            if page.get("ui_issues"):
                summary["total_ui_issues"] += len(page["ui_issues"])
                has_issues = True
                
            if has_issues:
                summary["pages_with_issues"] += 1
        
        summary["all_missing_files"] = list(summary["all_missing_files"])
        
        # Save detailed report
        report_data = {
            "timestamp": timestamp,
            "summary": summary,
            "details": all_issues
        }
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        # Print summary
        print("\n" + "="*60)
        print("📊 COMPREHENSIVE SITE CHECK SUMMARY")
        print("="*60)
        print(f"Total pages checked: {summary['total_pages']}")
        print(f"Pages with issues: {summary['pages_with_issues']}")
        print(f"\n🔴 Critical Issues:")
        print(f"  - Input field problems: {summary['total_input_problems']}")
        print(f"  - Missing CSS files: {summary['total_css_missing']}")
        print(f"  - Missing JS files: {summary['total_js_missing']}")
        print(f"  - JavaScript errors: {summary['total_js_errors']}")
        print(f"  - Form issues: {summary['total_form_issues']}")
        print(f"  - UI/Styling issues: {summary['total_ui_issues']}")
        
        if summary["all_missing_files"]:
            print(f"\n📁 Missing Files:")
            for file in sorted(summary["all_missing_files"])[:10]:
                print(f"  - {file}")
            if len(summary["all_missing_files"]) > 10:
                print(f"  ... and {len(summary['all_missing_files']) - 10} more")
        
        print(f"\n📄 Full report saved to: {report_path}")

async def main():
    checker = ComprehensiveSiteChecker()
    await checker.run_comprehensive_check()

if __name__ == "__main__":
    asyncio.run(main())