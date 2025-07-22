import os
import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def fix_csp_in_file(file_path):
    """Fix CSP text that appears outside meta tags"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to find exposed CSP text (not inside meta tag)
    # This will match CSP text that starts with self' and is not part of a meta tag
    exposed_csp_pattern = r"(?<!content=\")self' https:; frame-src[^\"]*?(?=\">|$)"
    
    fixed = False
    if re.search(exposed_csp_pattern, content):
        print(f"Fixing: {file_path}")
        # Remove the exposed text
        content = re.sub(exposed_csp_pattern, '', content)
        fixed = True
    
    # Also check for incomplete meta tags
    # Pattern: CSP content followed by "> without opening meta tag
    incomplete_pattern = r'(self\' https:; frame-src[^<]*?)\">'
    if re.search(incomplete_pattern, content) and '<meta' not in content[max(0, content.find("self' https:") - 50):content.find("self' https:")]:
        print(f"Fixing incomplete tag in: {file_path}")
        content = re.sub(incomplete_pattern, '', content)
        fixed = True
    
    if fixed:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Fix CSP issues in all HTML files"""
    fixed_files = []
    
    # HTML files to check
    html_files = []
    for root, dirs, files in os.walk('.'):
        # Skip node_modules and reports
        if 'node_modules' in root or 'reports' in root:
            continue
        for file in files:
            if file.endswith('.html') and not file.endswith('.backup'):
                html_files.append(os.path.join(root, file))
    
    print(f"Checking {len(html_files)} HTML files...")
    
    for file_path in html_files:
        if fix_csp_in_file(file_path):
            fixed_files.append(file_path)
    
    if fixed_files:
        print(f"\n✅ Fixed {len(fixed_files)} files:")
        for file in fixed_files:
            print(f"   - {file}")
    else:
        print("\n✅ No files needed fixing")

if __name__ == "__main__":
    main()