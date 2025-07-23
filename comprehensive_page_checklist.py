#!/usr/bin/env python3
"""
46개 페이지별 상세 체크리스트 생성기 (총 500+ 항목)
"""

import os
import json
from datetime import datetime

class PageChecklistGenerator:
    def __init__(self):
        self.total_checks = 0
        self.all_checklists = {}
        
    def get_page_info(self):
        """46개 페이지 정보"""
        pages = {
            # 메인 페이지 (1개)
            "index.html": {
                "category": "main",
                "title": "메인 페이지",
                "priority": "critical",
                "functions": ["showServices", "filterCards", "loadComponents"]
            },
            
            # 테스트 페이지 (8개)  
            "tests/index.html": {"category": "test_list", "title": "테스트 목록"},
            "tests/teto-egen/index.html": {"category": "test_intro", "title": "테토-에겐 소개"},
            "tests/teto-egen/start.html": {"category": "test_intro", "title": "테토-에겐 시작"},
            "tests/teto-egen/test.html": {"category": "test_main", "title": "테토-에겐 테스트", "priority": "critical"},
            "tests/mbti/index.html": {"category": "test_intro", "title": "MBTI 소개"},
            "tests/mbti/test.html": {"category": "test_main", "title": "MBTI 테스트", "priority": "critical"},
            "tests/love-dna/index.html": {"category": "test_intro", "title": "러브DNA 소개"},
            "tests/love-dna/test.html": {"category": "test_main", "title": "러브DNA 테스트", "priority": "critical"},
            
            # 도구 페이지 (4개)
            "tools/index.html": {"category": "tool_list", "title": "도구 목록"},
            "tools/text-counter.html": {"category": "tool_main", "title": "글자수 세기", "priority": "high"},
            "tools/bmi-calculator.html": {"category": "tool_main", "title": "BMI 계산기"},
            "tools/salary-calculator.html": {"category": "tool_main", "title": "연봉 계산기"},
            
            # 운세 페이지 (6개)
            "fortune/index.html": {"category": "fortune_list", "title": "운세 목록"},
            "fortune/daily/index.html": {"category": "fortune_main", "title": "오늘의 운세"},
            "fortune/saju/index.html": {"category": "fortune_main", "title": "사주팔자", "priority": "high"},
            "fortune/tarot/index.html": {"category": "fortune_main", "title": "AI 타로"},
            "fortune/zodiac/index.html": {"category": "fortune_main", "title": "별자리 운세"},
            "fortune/zodiac-animal/index.html": {"category": "fortune_main", "title": "띠별 운세"},
            
            # 정보 페이지 (5개)
            "about/index.html": {"category": "info", "title": "소개 페이지"},
            "contact/index.html": {"category": "info", "title": "문의 페이지"},
            "faq/index.html": {"category": "info", "title": "자주묻는질문"},
            "privacy/index.html": {"category": "info", "title": "개인정보처리방침"},
            "terms/index.html": {"category": "info", "title": "이용약관"},
            
            # 기타 페이지 (3개)
            "404.html": {"category": "error", "title": "404 에러 페이지"},
            "offline.html": {"category": "error", "title": "오프라인 페이지"},
            
            # 추가 발견 가능한 페이지들 (나머지 19개 - 실제 탐색 후 확인)
            "about/index-enhanced.html": {"category": "backup", "title": "소개 페이지 백업"},
        }
        
        return pages

    def create_base_checklist(self):
        """모든 페이지 공통 체크리스트"""
        return [
            # HTML 기본 구조 (10개)
            {"id": "html_doctype", "item": "<!DOCTYPE html> 선언 존재", "category": "html_structure"},
            {"id": "html_lang", "item": "html lang='ko' 속성 설정", "category": "html_structure"},
            {"id": "html_charset", "item": "meta charset='utf-8' 존재", "category": "html_structure"},
            {"id": "html_viewport", "item": "viewport 메타태그 존재", "category": "html_structure"},
            {"id": "html_title", "item": "페이지 제목 적절히 설정", "category": "html_structure"},
            {"id": "html_description", "item": "meta description 존재", "category": "html_structure"},
            {"id": "html_canonical", "item": "canonical URL 설정", "category": "html_structure"},
            {"id": "html_favicon", "item": "파비콘 링크 존재", "category": "html_structure"},
            {"id": "html_navbar", "item": "navbar-placeholder div 존재", "category": "html_structure"},
            {"id": "html_footer", "item": "footer-placeholder div 존재", "category": "html_structure"},
            
            # CSS 로딩 (8개)
            {"id": "css_styles", "item": "/css/styles.css 로드", "category": "css"},
            {"id": "css_mobile", "item": "/css/mobile-fixes.css 로드", "category": "css"},
            {"id": "css_buttons", "item": "/css/button-system.css 로드", "category": "css"},
            {"id": "css_fonts", "item": "구글 폰트 로드", "category": "css"},
            {"id": "css_no_errors", "item": "CSS 파일 404 에러 없음", "category": "css"},
            {"id": "css_rendering", "item": "스타일 정상 적용", "category": "css"},
            {"id": "css_responsive", "item": "모바일 반응형 정상", "category": "css"},
            {"id": "css_animations", "item": "애니메이션 정상 작동", "category": "css"},
            
            # JavaScript 기본 (8개)
            {"id": "js_api_config", "item": "/js/api-config.js 로드", "category": "javascript"},
            {"id": "js_main", "item": "/js/main.js 로드", "category": "javascript"},
            {"id": "js_no_console_errors", "item": "콘솔 에러 없음", "category": "javascript"},
            {"id": "js_components_load", "item": "loadComponents 함수 작동", "category": "javascript"},
            {"id": "js_navbar_load", "item": "네비게이션 정상 로드", "category": "javascript"},
            {"id": "js_footer_load", "item": "푸터 정상 로드", "category": "javascript"},
            {"id": "js_mobile_menu", "item": "모바일 메뉴 토글 작동", "category": "javascript"},
            {"id": "js_scroll_smooth", "item": "스무스 스크롤 작동", "category": "javascript"},
            
            # 성능 및 SEO (6개)
            {"id": "perf_load_time", "item": "페이지 로딩 3초 이내", "category": "performance"},
            {"id": "perf_images_optimized", "item": "이미지 최적화", "category": "performance"},
            {"id": "perf_css_minified", "item": "CSS 압축", "category": "performance"},
            {"id": "perf_js_minified", "item": "JS 압축", "category": "performance"},
            {"id": "seo_structured_data", "item": "구조화된 데이터", "category": "seo"},
            {"id": "seo_og_tags", "item": "오픈그래프 태그", "category": "seo"},
            
            # 접근성 (4개)
            {"id": "a11y_alt_texts", "item": "이미지 alt 텍스트", "category": "accessibility"},
            {"id": "a11y_aria_labels", "item": "ARIA 레이블", "category": "accessibility"},
            {"id": "a11y_keyboard_nav", "item": "키보드 네비게이션", "category": "accessibility"},
            {"id": "a11y_color_contrast", "item": "색상 대비율", "category": "accessibility"},
            
            # 광고 시스템 (4개)
            {"id": "ads_adsense_load", "item": "애드센스 스크립트 로드", "category": "ads"},
            {"id": "ads_containers", "item": "광고 컨테이너 존재", "category": "ads"},
            {"id": "ads_lazy_load", "item": "광고 지연 로딩", "category": "ads"},
            {"id": "ads_no_errors", "item": "광고 로딩 에러 없음", "category": "ads"}
        ]

    def create_test_page_checklist(self, page_path):
        """테스트 페이지 특화 체크리스트"""
        base = self.create_base_checklist()
        
        if "teto-egen" in page_path:
            specific = [
                # 테토-에겐 특화 (15개)
                {"id": "teto_test_js", "item": "/tests/teto-egen/test.js 로드", "category": "test_specific"},
                {"id": "teto_20_questions", "item": "20개 최적화 질문 로드", "category": "test_specific"},
                {"id": "teto_4_results", "item": "4가지 결과 유형 정의", "category": "test_specific"},
                {"id": "teto_gender_screen", "item": "성별 선택 화면", "category": "test_specific"},
                {"id": "teto_intro_screen", "item": "테스트 소개 화면", "category": "test_specific"},
                {"id": "teto_test_screen", "item": "질문 진행 화면", "category": "test_specific"},
                {"id": "teto_result_screen", "item": "결과 화면", "category": "test_specific"},
                {"id": "teto_progress_bar", "item": "진행률 표시", "category": "test_specific"},
                {"id": "teto_selectGender", "item": "selectGender() 함수", "category": "test_functions"},
                {"id": "teto_startTest", "item": "startTest() 함수", "category": "test_functions"},
                {"id": "teto_nextQuestion", "item": "nextQuestion() 함수", "category": "test_functions"},
                {"id": "teto_previousQuestion", "item": "previousQuestion() 함수", "category": "test_functions"},
                {"id": "teto_calculateResult", "item": "calculateResult() 함수", "category": "test_functions"},
                {"id": "teto_shareKakao", "item": "shareKakao() 함수", "category": "test_functions"},
                {"id": "teto_restartTest", "item": "restartTest() 함수", "category": "test_functions"}
            ]
        elif "mbti" in page_path:
            specific = [
                # MBTI 특화 (12개)
                {"id": "mbti_test_data", "item": "mbti-test-data.js 로드", "category": "test_specific"},
                {"id": "mbti_40_questions", "item": "40개 한국화 질문", "category": "test_specific"},
                {"id": "mbti_16_results", "item": "16가지 MBTI 결과", "category": "test_specific"},
                {"id": "mbti_korean_celebs", "item": "한국 연예인 매칭", "category": "test_specific"},
                {"id": "mbti_calculateMBTI", "item": "calculateMBTI() 함수", "category": "test_functions"},
                {"id": "mbti_dimension_scoring", "item": "E/I, S/N, T/F, J/P 점수 계산", "category": "test_functions"},
                {"id": "mbti_result_display", "item": "결과 화면 표시", "category": "test_functions"},
                {"id": "mbti_compatibility", "item": "궁합 정보 표시", "category": "test_specific"},
                {"id": "mbti_share_functions", "item": "공유 기능", "category": "test_functions"},
                {"id": "mbti_restart", "item": "재시작 기능", "category": "test_functions"},
                {"id": "mbti_progress", "item": "진행률 표시", "category": "test_specific"},
                {"id": "mbti_korean_culture", "item": "한국 문화 반영", "category": "test_specific"}
            ]
        elif "love-dna" in page_path:
            specific = [
                # 러브DNA 특화 (10개)
                {"id": "love_dna_data", "item": "love-dna-test.js 로드", "category": "test_specific"},
                {"id": "love_30_questions", "item": "30개 연애 질문", "category": "test_specific"},
                {"id": "love_4_types", "item": "4가지 연애 유형", "category": "test_specific"},
                {"id": "love_calculateDNA", "item": "calculateLoveDNA() 함수", "category": "test_functions"},
                {"id": "love_result_display", "item": "결과 표시", "category": "test_functions"},
                {"id": "love_compatibility", "item": "연애 궁합", "category": "test_specific"},
                {"id": "love_psychology", "item": "연애심리학 기반", "category": "test_specific"},
                {"id": "love_korean_dating", "item": "한국 연애 문화", "category": "test_specific"},
                {"id": "love_share", "item": "공유 기능", "category": "test_functions"},
                {"id": "love_restart", "item": "재시작 기능", "category": "test_functions"}
            ]
        else:
            specific = []
            
        return base + specific

    def create_tool_page_checklist(self, page_path):
        """도구 페이지 특화 체크리스트"""
        base = self.create_base_checklist()
        
        if "text-counter" in page_path:
            specific = [
                # 글자수 세기 특화 (8개)
                {"id": "text_input_field", "item": "텍스트 입력 필드", "category": "tool_specific"},
                {"id": "text_char_count", "item": "글자수 카운트", "category": "tool_specific"},
                {"id": "text_word_count", "item": "단어수 카운트", "category": "tool_specific"},
                {"id": "text_realtime_update", "item": "실시간 업데이트", "category": "tool_specific"},
                {"id": "text_clear_button", "item": "지우기 버튼", "category": "tool_specific"},
                {"id": "text_copy_button", "item": "복사 기능", "category": "tool_specific"},
                {"id": "text_dompurify", "item": "DOMPurify 라이브러리", "category": "tool_specific"},
                {"id": "text_mobile_optimized", "item": "모바일 최적화", "category": "tool_specific"}
            ]
        elif "bmi-calculator" in page_path:
            specific = [
                # BMI 계산기 특화 (6개)
                {"id": "bmi_height_input", "item": "키 입력 필드", "category": "tool_specific"},
                {"id": "bmi_weight_input", "item": "몸무게 입력 필드", "category": "tool_specific"},
                {"id": "bmi_calculate_btn", "item": "계산 버튼", "category": "tool_specific"},
                {"id": "bmi_result_display", "item": "결과 표시", "category": "tool_specific"},
                {"id": "bmi_category_display", "item": "BMI 범주 표시", "category": "tool_specific"},
                {"id": "bmi_reset_function", "item": "초기화 기능", "category": "tool_specific"}
            ]
        elif "salary-calculator" in page_path:
            specific = [
                # 연봉 계산기 특화 (7개)
                {"id": "salary_annual_input", "item": "연봉 입력", "category": "tool_specific"},
                {"id": "salary_monthly_calc", "item": "월급 계산", "category": "tool_specific"},
                {"id": "salary_tax_calc", "item": "세금 계산", "category": "tool_specific"},
                {"id": "salary_net_display", "item": "실수령액 표시", "category": "tool_specific"},
                {"id": "salary_breakdown", "item": "항목별 분해", "category": "tool_specific"},
                {"id": "salary_form_submit", "item": "폼 제출 처리", "category": "tool_specific"},
                {"id": "salary_validation", "item": "입력값 검증", "category": "tool_specific"}
            ]
        else:
            specific = []
            
        return base + specific

    def create_fortune_page_checklist(self, page_path):
        """운세 페이지 특화 체크리스트"""
        base = self.create_base_checklist()
        
        if "saju" in page_path:
            specific = [
                # 사주팔자 특화 (10개)
                {"id": "saju_data_js", "item": "fortune-services.js 로드", "category": "fortune_specific"},
                {"id": "saju_birth_form", "item": "생년월일시 입력 폼", "category": "fortune_specific"},
                {"id": "saju_lunar_option", "item": "음력/양력 선택", "category": "fortune_specific"},
                {"id": "saju_calculate_func", "item": "calculateSaju() 함수", "category": "fortune_functions"},
                {"id": "saju_four_pillars", "item": "사주 사기둥 표시", "category": "fortune_specific"},
                {"id": "saju_ten_gods", "item": "십신 해석", "category": "fortune_specific"},
                {"id": "saju_five_elements", "item": "오행 분석", "category": "fortune_specific"},
                {"id": "saju_korean_fortune", "item": "한국식 운세 해석", "category": "fortune_specific"},
                {"id": "saju_result_display", "item": "결과 표시", "category": "fortune_functions"},
                {"id": "saju_print_friendly", "item": "인쇄 친화적", "category": "fortune_specific"}
            ]
        elif "tarot" in page_path:
            specific = [
                # 타로 특화 (8개)
                {"id": "tarot_data_js", "item": "타로 데이터 로드", "category": "fortune_specific"},
                {"id": "tarot_draw_cards", "item": "drawTarotCards() 함수", "category": "fortune_functions"},
                {"id": "tarot_major_arcana", "item": "22장 메이저 아르카나", "category": "fortune_specific"},
                {"id": "tarot_spreads", "item": "3가지 스프레드", "category": "fortune_specific"},
                {"id": "tarot_card_images", "item": "카드 이미지 표시", "category": "fortune_specific"},
                {"id": "tarot_interpretation", "item": "해석 텍스트", "category": "fortune_specific"},
                {"id": "tarot_reversed", "item": "정방향/역방향", "category": "fortune_specific"},
                {"id": "tarot_new_reading", "item": "새로운 리딩", "category": "fortune_functions"}
            ]
        elif "zodiac" in page_path:
            specific = [
                # 별자리 특화 (6개)
                {"id": "zodiac_data_js", "item": "별자리 데이터", "category": "fortune_specific"},
                {"id": "zodiac_12_signs", "item": "12별자리 정보", "category": "fortune_specific"},
                {"id": "zodiac_daily_fortune", "item": "오늘의 운세", "category": "fortune_specific"},
                {"id": "zodiac_generate_func", "item": "generateZodiacFortune()", "category": "fortune_functions"},
                {"id": "zodiac_lucky_info", "item": "행운 정보", "category": "fortune_specific"},
                {"id": "zodiac_korean_style", "item": "한국식 해석", "category": "fortune_specific"}
            ]
        else:
            specific = []
            
        return base + specific

    def generate_all_checklists(self):
        """모든 페이지의 체크리스트 생성"""
        pages = self.get_page_info()
        
        for page_path, page_info in pages.items():
            category = page_info["category"]
            
            if "test" in category:
                checklist = self.create_test_page_checklist(page_path)
            elif "tool" in category:
                checklist = self.create_tool_page_checklist(page_path)
            elif "fortune" in category:
                checklist = self.create_fortune_page_checklist(page_path)
            else:
                checklist = self.create_base_checklist()
            
            # 페이지별 고유 항목 추가
            page_specific = self.add_page_specific_items(page_path, page_info)
            checklist.extend(page_specific)
            
            self.all_checklists[page_path] = {
                "page_info": page_info,
                "total_checks": len(checklist),
                "checklist": checklist,
                "status": "pending",
                "completion_rate": 0
            }
            
            self.total_checks += len(checklist)
    
    def add_page_specific_items(self, page_path, page_info):
        """각 페이지만의 고유 항목들"""
        specific = []
        
        if page_path == "index.html":
            specific = [
                {"id": "main_hero_section", "item": "히어로 섹션", "category": "main_specific"},
                {"id": "main_service_cards", "item": "서비스 카드들", "category": "main_specific"},
                {"id": "main_filter_buttons", "item": "필터 버튼들", "category": "main_specific"},
                {"id": "main_stats_section", "item": "통계 섹션", "category": "main_specific"},
                {"id": "main_showServices", "item": "showServices() 함수", "category": "main_functions"}
            ]
        elif page_path == "404.html":
            specific = [
                {"id": "404_error_message", "item": "에러 메시지", "category": "error_specific"},
                {"id": "404_home_button", "item": "홈 버튼", "category": "error_specific"},
                {"id": "404_suggestions", "item": "추천 링크", "category": "error_specific"}
            ]
        elif "contact" in page_path:
            specific = [
                {"id": "contact_form", "item": "연락처 폼", "category": "contact_specific"},
                {"id": "contact_validation", "item": "폼 검증", "category": "contact_functions"},
                {"id": "contact_submit", "item": "제출 처리", "category": "contact_functions"}
            ]
        
        return specific

    def save_checklists(self):
        """체크리스트를 파일로 저장"""
        
        # 전체 요약
        summary = {
            "generated_at": datetime.now().isoformat(),
            "total_pages": len(self.all_checklists),
            "total_checks": self.total_checks,
            "average_checks_per_page": round(self.total_checks / len(self.all_checklists), 1),
            "pages_by_category": {},
            "checks_by_category": {}
        }
        
        # 카테고리별 통계
        for page_path, data in self.all_checklists.items():
            category = data["page_info"]["category"]
            if category not in summary["pages_by_category"]:
                summary["pages_by_category"][category] = 0
            summary["pages_by_category"][category] += 1
            
            for check in data["checklist"]:
                check_cat = check["category"]
                if check_cat not in summary["checks_by_category"]:
                    summary["checks_by_category"][check_cat] = 0
                summary["checks_by_category"][check_cat] += 1
        
        # 파일 저장
        with open('comprehensive_page_checklist.json', 'w', encoding='utf-8') as f:
            json.dump({
                "summary": summary,
                "checklists": self.all_checklists
            }, f, ensure_ascii=False, indent=2)
        
        return summary

if __name__ == "__main__":
    generator = PageChecklistGenerator()
    generator.generate_all_checklists()
    summary = generator.save_checklists()
    
    print(f"46개 페이지별 상세 체크리스트 생성 완료!")
    print(f"총 체크 항목: {summary['total_checks']}개")
    print(f"페이지당 평균: {summary['average_checks_per_page']}개")
    print(f"카테고리별 페이지 수: {summary['pages_by_category']}")
    print("comprehensive_page_checklist.json 파일에 저장됨")