import re

with open('tests/index.html', 'r') as f:
    content = f.read()

csp_match = re.search(r'http-equiv=["\']Content-Security-Policy["\'][^>]*content=["\']([^"\']+)["\']', content)
if csp_match:
    csp = csp_match.group(1)
    print('Found CSP:', csp[:100], '...')
    print('Has script-src:', 'script-src' in csp)
    print('Has style-src:', 'style-src' in csp)
    print('Has unsafe-inline:', "'unsafe-inline'" in csp)
    
    script_unsafe = "'unsafe-inline'" in csp and 'script-src' in csp
    style_unsafe = "'unsafe-inline'" in csp and 'style-src' in csp
    print('Script safe:', script_unsafe)
    print('Style safe:', style_unsafe)
else:
    print('No CSP found')
    
# Try alternative regex
csp_match2 = re.search(r'Content-Security-Policy.*?content=["\']([^"\']+)["\']', content, re.DOTALL)
if csp_match2:
    print('\nAlternative regex worked!')
    csp = csp_match2.group(1)
    print('CSP content:', csp[:100])