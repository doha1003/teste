import tempfile
import os
import subprocess

PROJECT_ROOT = "C:/Users/pc/teste"

issue_body = '''**Description:**
The `/about/` page exhibits a Cumulative Layout Shift (CLS) score of 0.118, which is above the recommended threshold (0.1). This indicates that visual elements on the page are shifting unexpectedly during loading, leading to a poor user experience.

**Affected Page:**
*   `https://doha.kr/about/`

**Impact:**
*   **Poor User Experience:** Unexpected layout shifts can be disorienting and frustrating for users, potentially leading to misclicks.
*   **Negative SEO Impact:** CLS is a Core Web Vital metric, and a poor score can negatively affect search engine rankings.

**Proposed Solution:**
1.  **Identify Shifting Elements:** Analyze the `/about/` page's DOM and CSS to pinpoint the specific elements causing the layout shifts. Common culprits include images without dimensions, dynamically injected content, or ads.
2.  **Specify Dimensions for Images/Videos:** Ensure all images and video elements have explicit `width` and `height` attributes or are styled with CSS aspect ratio boxes.
3.  **Pre-allocate Space for Dynamically Injected Content:** For elements that load dynamically (e.g., ads, embeds), reserve space for them using CSS (e.g., `min-height`, `min-width`) to prevent layout shifts.
4.  **Avoid Inserting Content Above Existing Content:** Unless in response to a user interaction, avoid inserting new content above existing content, as this can push down visible content.

**Priority:** Medium (Direct impact on user experience and Core Web Vitals)'''

with tempfile.NamedTemporaryFile(mode='w', delete=False, encoding='utf-8') as tmp_file:
    tmp_file.write(issue_body)
    tmp_file_path = tmp_file.name

try:
    command = f'gh issue create --title "[Bug] Fix Cumulative Layout Shift (CLS) on About Page" --body-file "{tmp_file_path}"'
    result = subprocess.run(command, shell=True, capture_output=True, text=True, check=True, cwd=PROJECT_ROOT)
    print(result.stdout)
    print(result.stderr)
except subprocess.CalledProcessError as e:
    print(f"Error creating GitHub issue: {e}")
    print(f"Stdout: {e.stdout}")
    print(f"Stderr: {e.stderr}")
finally:
    os.remove(tmp_file_path)