#!/usr/bin/env python3
"""
실제 서비스 페이지만 검토
"""

import os
import json

# 실제 서비스 페이지만 필터링
service_pages = []
for root, dirs, files in os.walk('.'):
    if 'development' in root or 'reports' in root or 'backup' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html') and not file.startswith('test-') and not file.endswith('_snapshot.html'):
            path = os.path.join(root, file).replace('.\\', '').replace('\\', '/')
            if 'includes' not in path:
                service_pages.append(path)

print(f'실제 서비스 페이지: {len(service_pages)}개')
print('=' * 60)

# 카테고리별 분류
categories = {
    'main': [],
    'tests': [],
    'tools': [],
    'fortune': [],
    'info': [],
    'etc': []
}

for page in sorted(service_pages):
    if page == 'index.html':
        categories['main'].append(page)
    elif 'tests/' in page:
        categories['tests'].append(page)
    elif 'tools/' in page:
        categories['tools'].append(page)
    elif 'fortune/' in page:
        categories['fortune'].append(page)
    elif page in ['about/index.html', 'contact/index.html', 'privacy/index.html', 'terms/index.html', 'faq/index.html']:
        categories['info'].append(page)
    else:
        categories['etc'].append(page)

for category, pages in categories.items():
    if pages:
        print(f'\n{category.upper()} ({len(pages)}개):')
        for page in pages:
            print(f'  - {page}')