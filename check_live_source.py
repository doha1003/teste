import requests
import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def check_live_html():
    """Check the actual live HTML source"""
    url = "https://doha.kr"
    
    try:
        response = requests.get(url)
        html = response.text
        
        # Look for exposed CSP text
        lines = html.split('\n')
        problem_found = False
        
        for i, line in enumerate(lines):
            if "self' https:; frame-src 'self'" in line and '<meta' not in line:
                print(f"❌ Found exposed CSP text at line {i+1}:")
                print(f"   {line.strip()[:200]}...")
                if i > 0:
                    print(f"   Previous: {lines[i-1].strip()[:200]}...")
                if i < len(lines) - 1:
                    print(f"   Next: {lines[i+1].strip()[:200]}...")
                problem_found = True
                
                # Save problematic portion
                start = max(0, i-5)
                end = min(len(lines), i+5)
                with open("problematic_section.html", "w", encoding='utf-8') as f:
                    f.write('\n'.join(lines[start:end]))
                print(f"\n   Saved context to problematic_section.html")
                break
        
        if not problem_found:
            print("✅ No exposed CSP text found in live HTML")
            
            # But let's check if there's any malformed meta tag
            meta_pattern = r'<meta[^>]*Content-Security-Policy[^>]*>'
            matches = re.findall(meta_pattern, html, re.IGNORECASE)
            if matches:
                print(f"\nFound {len(matches)} CSP meta tag(s):")
                for match in matches:
                    if match.count('"') % 2 != 0:
                        print(f"   ⚠️ Possibly malformed: {match[:100]}...")
                    else:
                        print(f"   ✅ OK: {match[:100]}...")
                        
    except Exception as e:
        print(f"Error fetching page: {e}")

if __name__ == "__main__":
    check_live_html()