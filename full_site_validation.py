"""
doha.kr 웹사이트 전체 검증 스크립트
실제 사용자 관점에서 모든 주요 페이지를 테스트합니다.
"""

import os
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('validation_report.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class SiteValidator:
    def __init__(self):
        self.base_url = "https://doha.kr"
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "pages": {},
            "summary": {
                "total_pages": 0,
                "passed": 0,
                "failed": 0,
                "issues": []
            }
        }
        self.setup_driver()
        
    def setup_driver(self):
        """Chrome 드라이버 설정"""
        options = Options()
        options.add_argument('--headless')  # 백그라운드 실행
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def check_page(self, page_path, page_name):
        """개별 페이지 검증"""
        url = f"{self.base_url}{page_path}"
        page_result = {
            "url": url,
            "name": page_name,
            "status": "pass",
            "issues": [],
            "console_errors": [],
            "load_time": 0,
            "navigation_ok": False,
            "footer_ok": False,
            "visual_issues": [],
            "functionality": {}
        }
        
        try:
            # 페이지 로드
            start_time = time.time()
            self.driver.get(url)
            page_result["load_time"] = time.time() - start_time
            
            # 페이지 로드 대기
            time.sleep(2)
            
            # 콘솔 에러 체크
            logs = self.driver.get_log('browser')
            for log in logs:
                if log['level'] == 'SEVERE':
                    page_result["console_errors"].append(log['message'])
                    page_result["issues"].append(f"콘솔 에러: {log['message']}")
            
            # 네비게이션 체크
            try:
                nav = self.driver.find_element(By.TAG_NAME, 'nav')
                if nav.is_displayed():
                    page_result["navigation_ok"] = True
                else:
                    page_result["issues"].append("네비게이션이 표시되지 않음")
            except NoSuchElementException:
                page_result["issues"].append("네비게이션 요소를 찾을 수 없음")
            
            # 푸터 체크
            try:
                footer = self.driver.find_element(By.TAG_NAME, 'footer')
                if footer.is_displayed():
                    page_result["footer_ok"] = True
                else:
                    page_result["issues"].append("푸터가 표시되지 않음")
            except NoSuchElementException:
                page_result["issues"].append("푸터 요소를 찾을 수 없음")
            
            # 페이지별 특수 검증
            if "fortune" in page_path:
                self.check_fortune_page(page_result)
            elif "mbti/test" in page_path:
                self.check_mbti_test(page_result)
            elif "tarot" in page_path:
                self.check_tarot_page(page_result)
            elif "saju" in page_path:
                self.check_saju_page(page_result)
            
            # 스크린샷 저장
            screenshot_dir = "validation_screenshots"
            os.makedirs(screenshot_dir, exist_ok=True)
            screenshot_path = os.path.join(screenshot_dir, f"{page_name.replace(' ', '_')}.png")
            self.driver.save_screenshot(screenshot_path)
            page_result["screenshot"] = screenshot_path
            
            # 시각적 문제 체크 (기본적인 레이아웃 검사)
            self.check_visual_issues(page_result)
            
        except Exception as e:
            page_result["status"] = "fail"
            page_result["issues"].append(f"페이지 로드 실패: {str(e)}")
            logging.error(f"Error checking {url}: {str(e)}")
        
        # 결과 판정
        if page_result["issues"]:
            page_result["status"] = "fail"
            self.results["summary"]["failed"] += 1
        else:
            self.results["summary"]["passed"] += 1
        
        self.results["pages"][page_name] = page_result
        self.results["summary"]["total_pages"] += 1
        
        return page_result
    
    def check_fortune_page(self, page_result):
        """운세 페이지 기능 검증"""
        try:
            # 폼 요소 체크
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            if forms:
                page_result["functionality"]["forms_found"] = len(forms)
                
                # 입력 필드 체크
                inputs = self.driver.find_elements(By.CSS_SELECTOR, 'input, select')
                page_result["functionality"]["input_fields"] = len(inputs)
                
                # 버튼 체크
                buttons = self.driver.find_elements(By.CSS_SELECTOR, 'button, input[type="submit"]')
                page_result["functionality"]["buttons"] = len(buttons)
                
                if len(buttons) == 0:
                    page_result["issues"].append("제출 버튼을 찾을 수 없음")
            else:
                page_result["issues"].append("폼 요소를 찾을 수 없음")
                
        except Exception as e:
            page_result["issues"].append(f"운세 페이지 기능 검증 실패: {str(e)}")
    
    def check_mbti_test(self, page_result):
        """MBTI 테스트 기능 검증"""
        try:
            # 질문 요소 체크
            questions = self.driver.find_elements(By.CSS_SELECTOR, '.question, .question-container')
            page_result["functionality"]["questions_found"] = len(questions)
            
            # 선택지 체크
            options = self.driver.find_elements(By.CSS_SELECTOR, 'input[type="radio"], .option, .choice')
            page_result["functionality"]["options_found"] = len(options)
            
            # 진행 버튼 체크
            next_buttons = self.driver.find_elements(By.CSS_SELECTOR, 'button.next, #nextBtn')
            page_result["functionality"]["navigation_buttons"] = len(next_buttons)
            
            if len(questions) == 0:
                page_result["issues"].append("MBTI 질문을 찾을 수 없음")
                
        except Exception as e:
            page_result["issues"].append(f"MBTI 테스트 기능 검증 실패: {str(e)}")
    
    def check_tarot_page(self, page_result):
        """타로 페이지 기능 검증"""
        try:
            # 카드 요소 체크
            cards = self.driver.find_elements(By.CSS_SELECTOR, '.card, .tarot-card')
            page_result["functionality"]["cards_found"] = len(cards)
            
            # 카드 선택 버튼 체크
            card_buttons = self.driver.find_elements(By.CSS_SELECTOR, '.card-select, button.card')
            page_result["functionality"]["card_buttons"] = len(card_buttons)
            
            if len(cards) == 0 and len(card_buttons) == 0:
                page_result["issues"].append("타로 카드 요소를 찾을 수 없음")
                
        except Exception as e:
            page_result["issues"].append(f"타로 페이지 기능 검증 실패: {str(e)}")
    
    def check_saju_page(self, page_result):
        """사주 페이지 기능 검증"""
        try:
            # 생년월일 입력 필드 체크
            date_inputs = self.driver.find_elements(By.CSS_SELECTOR, 'input[type="date"], select[name*="year"], select[name*="month"], select[name*="day"]')
            page_result["functionality"]["date_inputs"] = len(date_inputs)
            
            # 시간 선택 체크
            time_inputs = self.driver.find_elements(By.CSS_SELECTOR, 'select[name*="hour"], input[name*="time"]')
            page_result["functionality"]["time_inputs"] = len(time_inputs)
            
            # 성별 선택 체크
            gender_inputs = self.driver.find_elements(By.CSS_SELECTOR, 'input[name*="gender"], select[name*="gender"]')
            page_result["functionality"]["gender_inputs"] = len(gender_inputs)
            
            if len(date_inputs) == 0:
                page_result["issues"].append("생년월일 입력 필드를 찾을 수 없음")
                
        except Exception as e:
            page_result["issues"].append(f"사주 페이지 기능 검증 실패: {str(e)}")
    
    def check_visual_issues(self, page_result):
        """시각적 문제 체크"""
        try:
            # viewport 크기 체크
            viewport_height = self.driver.execute_script("return window.innerHeight")
            body_height = self.driver.execute_script("return document.body.scrollHeight")
            
            # 요소 겹침 체크 (간단한 버전)
            elements = self.driver.find_elements(By.CSS_SELECTOR, 'div, section, header, footer, nav')
            overlapping = []
            
            for i in range(min(10, len(elements))):  # 처음 10개 요소만 체크
                elem1 = elements[i]
                rect1 = elem1.rect
                
                for j in range(i+1, min(10, len(elements))):
                    elem2 = elements[j]
                    rect2 = elem2.rect
                    
                    # 겹침 체크 (간단한 버전)
                    if (rect1['x'] < rect2['x'] + rect2['width'] and
                        rect1['x'] + rect1['width'] > rect2['x'] and
                        rect1['y'] < rect2['y'] + rect2['height'] and
                        rect1['y'] + rect1['height'] > rect2['y']):
                        overlapping.append(f"요소 겹침 감지")
                        break
            
            if overlapping:
                page_result["visual_issues"].extend(overlapping[:3])  # 최대 3개만 보고
                
        except Exception as e:
            logging.warning(f"Visual check failed: {str(e)}")
    
    def run_validation(self):
        """전체 검증 실행"""
        pages_to_check = [
            ("/", "홈페이지"),
            ("/fortune/daily/", "오늘의 운세"),
            ("/fortune/saju/", "사주 운세"),
            ("/fortune/tarot/", "타로 운세"),
            ("/fortune/zodiac/", "별자리 운세"),
            ("/fortune/zodiac-animal/", "띠 운세"),
            ("/tests/mbti/", "MBTI 테스트 소개"),
            ("/tests/mbti/test", "MBTI 테스트"),
            ("/tests/love-dna/", "연애 DNA 테스트 소개"),
            ("/tests/love-dna/test", "연애 DNA 테스트"),
            ("/tests/teto-egen/", "테토이젠 테스트 소개"),
            ("/tests/teto-egen/test", "테토이젠 테스트"),
            ("/tools/", "도구 모음"),
            ("/tools/bmi-calculator", "BMI 계산기"),
            ("/tools/salary-calculator", "연봉 계산기"),
            ("/tools/text-counter", "글자수 세기"),
            ("/about/", "소개"),
            ("/contact/", "문의하기"),
            ("/faq/", "자주 묻는 질문"),
            ("/privacy/", "개인정보처리방침"),
            ("/terms/", "이용약관")
        ]
        
        logging.info(f"검증 시작: {len(pages_to_check)}개 페이지")
        
        for page_path, page_name in pages_to_check:
            logging.info(f"검증 중: {page_name} ({page_path})")
            self.check_page(page_path, page_name)
            time.sleep(1)  # 서버 부하 방지
        
        # 주요 이슈 요약
        for page_name, result in self.results["pages"].items():
            if result["issues"]:
                for issue in result["issues"]:
                    self.results["summary"]["issues"].append(f"{page_name}: {issue}")
        
        # 결과 저장
        with open('validation_report.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        self.generate_report()
        
    def generate_report(self):
        """보고서 생성"""
        report = f"""
# doha.kr 웹사이트 검증 보고서

생성 시간: {self.results['timestamp']}

## 요약
- 총 페이지: {self.results['summary']['total_pages']}
- 통과: {self.results['summary']['passed']}
- 실패: {self.results['summary']['failed']}

## 주요 문제점
"""
        
        if self.results['summary']['issues']:
            for issue in self.results['summary']['issues'][:20]:  # 상위 20개만
                report += f"- {issue}\n"
        else:
            report += "- 발견된 문제 없음\n"
        
        report += "\n## 페이지별 상세 결과\n"
        
        for page_name, result in self.results['pages'].items():
            report += f"\n### {page_name}\n"
            report += f"- URL: {result['url']}\n"
            report += f"- 상태: {result['status']}\n"
            report += f"- 로드 시간: {result['load_time']:.2f}초\n"
            report += f"- 네비게이션: {'✓' if result['navigation_ok'] else '✗'}\n"
            report += f"- 푸터: {'✓' if result['footer_ok'] else '✗'}\n"
            
            if result['issues']:
                report += f"- 문제점:\n"
                for issue in result['issues']:
                    report += f"  - {issue}\n"
            
            if result['functionality']:
                report += f"- 기능 요소:\n"
                for key, value in result['functionality'].items():
                    report += f"  - {key}: {value}\n"
        
        with open('validation_report.md', 'w', encoding='utf-8') as f:
            f.write(report)
        
        logging.info("검증 완료. 보고서가 생성되었습니다.")
        
    def cleanup(self):
        """리소스 정리"""
        if hasattr(self, 'driver'):
            self.driver.quit()

if __name__ == "__main__":
    validator = SiteValidator()
    try:
        validator.run_validation()
    finally:
        validator.cleanup()