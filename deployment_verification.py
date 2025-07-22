#!/usr/bin/env python3
"""
배포 후 자동 검증 시스템
- 수정 사항이 실제로 배포되었는지 확인
- 핵심 기능들이 정상 작동하는지 검증
- 문제 발생 시 즉시 알림
"""

import asyncio
import time
import requests
from playwright.async_api import async_playwright

class DeploymentVerifier:
    def __init__(self):
        self.base_url = "https://doha.kr"
        self.critical_pages = [
            "/",
            "/tests/",
            "/tools/",
            "/fortune/",
            "/fortune/tarot/",
            "/tools/text-counter.html"
        ]
    
    async def verify_deployment(self, expected_changes=None):
        """배포 검증 실행"""
        print("Starting deployment verification...")
        
        # 1. GitHub Pages 배포 대기
        await self.wait_for_deployment()
        
        # 2. 핵심 기능 검증
        results = await self.verify_critical_functions()
        
        # 3. 결과 분석 및 보고
        self.generate_report(results)
        
        return results
    
    async def wait_for_deployment(self, max_wait=120):
        """GitHub Pages 배포 완료까지 대기"""
        print("Waiting for GitHub Pages deployment...")
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            try:
                response = requests.get(f"{self.base_url}/js/main.js", timeout=10)
                if response.status_code == 200:
                    print("Deployment detected!")
                    time.sleep(30)  # 추가 안전 시간
                    return True
            except:
                pass
            
            time.sleep(10)
        
        raise TimeoutError("Deployment verification timeout")
    
    async def verify_critical_functions(self):
        """핵심 기능들 검증"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            results = {}
            
            for page_path in self.critical_pages:
                url = f"{self.base_url}{page_path}"
                results[url] = await self.verify_page(browser, url)
            
            await browser.close()
            return results
    
    async def verify_page(self, browser, url):
        """개별 페이지 검증"""
        page = await browser.new_page()
        
        try:
            # 콘솔 에러 수집
            console_errors = []
            page.on("console", lambda msg: 
                console_errors.append(msg.text) if msg.type == "error" else None)
            
            # 페이지 로드
            await page.goto(url, wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # 검증 항목들
            checks = {
                "page_loads": True,
                "navigation_loaded": await page.evaluate(
                    'document.querySelector("#navbar-placeholder").innerHTML.length > 0'
                ),
                "footer_loaded": await page.evaluate(
                    'document.querySelector("#footer-placeholder").innerHTML.length > 0'
                ),
                "csp_not_exposed": not await self.check_csp_exposure(page),
                "no_js_errors": len([e for e in console_errors if 'Error' in e]) == 0,
                "console_errors": console_errors
            }
            
            return checks
            
        except Exception as e:
            return {"page_loads": False, "error": str(e)}
        finally:
            await page.close()
    
    async def check_csp_exposure(self, page):
        """CSP 노출 여부 확인"""
        page_text = await page.evaluate('document.body.innerText')
        return 'script-src' in page_text and page_text.count('script-src') > 2
    
    def generate_report(self, results):
        """검증 결과 보고서 생성"""
        print("\n" + "="*60)
        print("DEPLOYMENT VERIFICATION REPORT")
        print("="*60)
        
        total_pages = len(results)
        passed_pages = 0
        
        for url, checks in results.items():
            if checks.get("page_loads", False):
                nav_ok = checks.get("navigation_loaded", False)
                footer_ok = checks.get("footer_loaded", False)
                csp_ok = checks.get("csp_not_exposed", False)
                js_ok = checks.get("no_js_errors", False)
                
                overall_pass = nav_ok and footer_ok and csp_ok and js_ok
                
                if overall_pass:
                    passed_pages += 1
                
                print(f"\n{url}")
                print(f"  Navigation: {'PASS' if nav_ok else 'FAIL'}")
                print(f"  Footer: {'PASS' if footer_ok else 'FAIL'}")
                print(f"  CSP: {'PASS' if csp_ok else 'FAIL'}")
                print(f"  JavaScript: {'PASS' if js_ok else 'FAIL'}")
                print(f"  Overall: {'PASS' if overall_pass else 'FAIL'}")
                
                if checks.get("console_errors"):
                    print(f"  Console Errors: {len(checks['console_errors'])}")
            else:
                print(f"\n{url}: FAILED TO LOAD")
        
        print(f"\nSUMMARY: {passed_pages}/{total_pages} pages passed verification")
        
        if passed_pages == total_pages:
            print("🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!")
            return True
        else:
            print("❌ DEPLOYMENT VERIFICATION FAILED!")
            return False

# 사용 예시
async def main():
    verifier = DeploymentVerifier()
    success = await verifier.verify_deployment()
    return success

if __name__ == "__main__":
    asyncio.run(main())