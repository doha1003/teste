import os

def combine_css_files():
    """모든 CSS 모듈을 하나의 파일로 통합"""
    
    css_files = [
        'css/base/variables.css',
        'css/base/reset.css', 
        'css/base/typography.css',
        'css/components/navbar.css',
        'css/components/buttons.css',
        'css/components/footer.css',
        'css/components/cards.css',
        'css/themes/dark.css',
        'css/pages/home.css',
        'css/pages/tests.css',
        'css/pages/tools.css',
        'css/pages/fortune.css',
        'css/pages/common.css'
    ]
    
    combined_css = ""
    
    for css_file in css_files:
        if os.path.exists(css_file):
            print(f"Adding {css_file}...")
            with open(css_file, 'r', encoding='utf-8') as f:
                content = f.read()
                combined_css += f"\n/* ===== {css_file} ===== */\n"
                combined_css += content + "\n"
        else:
            print(f"Warning: {css_file} not found!")
    
    # 유틸리티 CSS 추가
    combined_css += """
/* ===== 전역 유틸리티 ===== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.section {
  padding: var(--space-4xl) 0;
}

.section-sm {
  padding: var(--space-2xl) 0;
}

.section-lg {
  padding: var(--space-4xl) 0;
}

/* 간격 유틸리티 */
.mt-auto { margin-top: auto; }
.mb-auto { margin-bottom: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }

.hidden { display: none; }
.visible { display: block; }

/* 반응형 유틸리티 */
@media (max-width: 768px) {
  .hidden-mobile { display: none; }
  .visible-mobile { display: block; }
}

@media (min-width: 769px) {
  .hidden-desktop { display: none; }
  .visible-desktop { display: block; }
}
"""
    
    # 통합된 CSS를 styles.css로 저장
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.write(combined_css)
    
    print(f"\n✅ 모든 CSS가 css/styles.css로 통합되었습니다!")
    print(f"총 파일 크기: {len(combined_css):,} characters")

if __name__ == "__main__":
    combine_css_files()