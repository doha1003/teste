import os
import re

def find_csp_text_outside_meta():
    """Find CSP text that appears outside of meta tags"""
    search_text = "self' https:; frame-src 'self'"
    problematic_files = []
    
    # HTML files to check
    html_files = []
    for root, dirs, files in os.walk('.'):
        # Skip node_modules
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Find all occurrences
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if search_text in line:
                    # Check if it's inside a meta tag
                    if '<meta' not in line:
                        print(f"\n❌ Found exposed text in: {file_path}")
                        print(f"   Line {i+1}: {line.strip()[:150]}...")
                        
                        # Show context
                        if i > 0:
                            print(f"   Line {i}: {lines[i-1].strip()[:150]}...")
                        if i < len(lines) - 1:
                            print(f"   Line {i+2}: {lines[i+1].strip()[:150]}...")
                        
                        problematic_files.append((file_path, i+1))
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    if problematic_files:
        print(f"\n\n🔍 Total files with exposed CSP text: {len(problematic_files)}")
        for file, line in problematic_files:
            print(f"   - {file} (line {line})")
    else:
        print("\n✅ No exposed CSP text found outside meta tags")

if __name__ == "__main__":
    find_csp_text_outside_meta()