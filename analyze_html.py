#!/usr/bin/env python3
"""
Comprehensive HTML File Analysis for doha.kr project
"""

import os
import re
from pathlib import Path
import json
from collections import defaultdict

# Root directory
ROOT_DIR = "/mnt/e/doha.kr_project_team/v1/teste_fix"

def find_html_files():
    """Find all HTML files in the project"""
    html_files = []
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    return sorted(html_files)

def find_existing_files():
    """Find all CSS and JS files that actually exist"""
    css_files = set()
    js_files = set()
    
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith('.css'):
                rel_path = os.path.relpath(os.path.join(root, file), ROOT_DIR)
                css_files.add('/' + rel_path.replace('\\', '/'))
            elif file.endswith('.js'):
                rel_path = os.path.relpath(os.path.join(root, file), ROOT_DIR)
                js_files.add('/' + rel_path.replace('\\', '/'))
    
    return css_files, js_files

def analyze_html_file(file_path):
    """Analyze a single HTML file for references"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()
        except:
            return None
    except:
        return None
    
    # Extract CSS references
    css_refs = []
    css_pattern = r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']'
    css_matches = re.findall(css_pattern, content, re.IGNORECASE)
    css_refs.extend(css_matches)
    
    # Also check for href first pattern
    css_pattern2 = r'<link[^>]*href=["\']([^"\']+\.css)["\'][^>]*rel=["\']stylesheet["\']'
    css_matches2 = re.findall(css_pattern2, content, re.IGNORECASE)
    css_refs.extend(css_matches2)
    
    # Extract JS references
    js_refs = []
    js_pattern = r'<script[^>]*src=["\']([^"\']+)["\']'
    js_matches = re.findall(js_pattern, content, re.IGNORECASE)
    js_refs.extend(js_matches)
    
    # Check for placeholders
    has_navbar_placeholder = 'navbar-placeholder' in content
    has_footer_placeholder = 'footer-placeholder' in content
    
    # Check for CSP header
    has_csp = 'Content-Security-Policy' in content
    has_unsafe_inline = 'unsafe-inline' in content
    
    # Extract title
    title_match = re.search(r'<title>([^<]+)</title>', content, re.IGNORECASE)
    title = title_match.group(1) if title_match else 'No title'
    
    return {
        'file_path': file_path,
        'css_refs': css_refs,
        'js_refs': js_refs,
        'has_navbar_placeholder': has_navbar_placeholder,
        'has_footer_placeholder': has_footer_placeholder,
        'has_csp': has_csp,
        'has_unsafe_inline': has_unsafe_inline,
        'title': title
    }

def categorize_html_files(html_files):
    """Categorize HTML files by type"""
    categories = defaultdict(list)
    
    for file_path in html_files:
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        
        if 'backup' in rel_path:
            categories['backup'].append(file_path)
        elif 'includes' in rel_path:
            categories['components'].append(file_path)
        elif rel_path == 'index.html':
            categories['main'].append(file_path)
        elif rel_path == '404.html' or rel_path == 'offline.html':
            categories['system'].append(file_path)
        elif rel_path.startswith('tests/'):
            categories['tests'].append(file_path)
        elif rel_path.startswith('tools/'):
            categories['tools'].append(file_path)
        elif rel_path.startswith('fortune/'):
            categories['fortune'].append(file_path)
        elif rel_path in ['about/index.html', 'contact/index.html', 'privacy/index.html', 'terms/index.html', 'faq/index.html']:
            categories['pages'].append(file_path)
        else:
            categories['other'].append(file_path)
    
    return categories

def main():
    print("=== doha.kr HTML Files Comprehensive Analysis ===\n")
    
    # Find all files
    html_files = find_html_files()
    existing_css, existing_js = find_existing_files()
    
    print(f"Found {len(html_files)} HTML files")
    print(f"Found {len(existing_css)} CSS files")
    print(f"Found {len(existing_js)} JS files")
    print()
    
    # Categorize files
    categories = categorize_html_files(html_files)
    
    print("=== 1. HTML FILE INVENTORY ===")
    for category, files in categories.items():
        print(f"\n{category.upper()} ({len(files)} files):")
        for file_path in files:
            rel_path = os.path.relpath(file_path, ROOT_DIR)
            print(f"  - {rel_path}")
    
    print("\n=== 2. CSS REFERENCE ANALYSIS ===")
    
    # Track all CSS references
    all_css_refs = set()
    missing_css = set()
    
    for file_path in html_files:
        if 'backup' in file_path:
            continue
            
        analysis = analyze_html_file(file_path)
        if not analysis:
            continue
            
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        
        if analysis['css_refs']:
            print(f"\n{rel_path}:")
            for css_ref in analysis['css_refs']:
                all_css_refs.add(css_ref)
                exists = css_ref in existing_css
                status = "✓" if exists else "✗ MISSING"
                print(f"  - {css_ref} [{status}]")
                if not exists and not css_ref.startswith('http'):
                    missing_css.add(css_ref)
    
    print(f"\n=== MISSING CSS FILES ({len(missing_css)}) ===")
    for css in sorted(missing_css):
        print(f"  ✗ {css}")
    
    print("\n=== 3. JAVASCRIPT REFERENCE ANALYSIS ===")
    
    # Track all JS references
    all_js_refs = set()
    missing_js = set()
    
    for file_path in html_files:
        if 'backup' in file_path:
            continue
            
        analysis = analyze_html_file(file_path)
        if not analysis:
            continue
            
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        
        if analysis['js_refs']:
            print(f"\n{rel_path}:")
            for js_ref in analysis['js_refs']:
                all_js_refs.add(js_ref)
                exists = js_ref in existing_js
                status = "✓" if exists else "✗ MISSING"
                print(f"  - {js_ref} [{status}]")
                if not exists and not js_ref.startswith('http'):
                    missing_js.add(js_ref)
    
    print(f"\n=== MISSING JS FILES ({len(missing_js)}) ===")
    for js in sorted(missing_js):
        print(f"  ✗ {js}")
    
    print("\n=== 4. COMPONENT PLACEHOLDER ANALYSIS ===")
    
    navbar_files = []
    footer_files = []
    missing_navbar = []
    missing_footer = []
    
    for file_path in html_files:
        if 'backup' in file_path or 'includes' in file_path:
            continue
            
        analysis = analyze_html_file(file_path)
        if not analysis:
            continue
            
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        
        if analysis['has_navbar_placeholder']:
            navbar_files.append(rel_path)
        else:
            missing_navbar.append(rel_path)
            
        if analysis['has_footer_placeholder']:
            footer_files.append(rel_path)
        else:
            missing_footer.append(rel_path)
    
    print(f"Files with navbar-placeholder ({len(navbar_files)}):")
    for f in navbar_files:
        print(f"  ✓ {f}")
    
    print(f"\nFiles missing navbar-placeholder ({len(missing_navbar)}):")
    for f in missing_navbar:
        print(f"  ✗ {f}")
    
    print(f"\nFiles with footer-placeholder ({len(footer_files)}):")
    for f in footer_files:
        print(f"  ✓ {f}")
    
    print(f"\nFiles missing footer-placeholder ({len(missing_footer)}):")
    for f in missing_footer:
        print(f"  ✗ {f}")
    
    print("\n=== 5. CSP HEADER ANALYSIS ===")
    
    csp_files = []
    no_csp_files = []
    unsafe_inline_files = []
    
    for file_path in html_files:
        if 'backup' in file_path or 'includes' in file_path:
            continue
            
        analysis = analyze_html_file(file_path)
        if not analysis:
            continue
            
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        
        if analysis['has_csp']:
            csp_files.append(rel_path)
            if analysis['has_unsafe_inline']:
                unsafe_inline_files.append(rel_path)
        else:
            no_csp_files.append(rel_path)
    
    print(f"Files with CSP headers ({len(csp_files)}):")
    for f in csp_files:
        print(f"  ✓ {f}")
    
    print(f"\nFiles missing CSP headers ({len(no_csp_files)}):")
    for f in no_csp_files:
        print(f"  ✗ {f}")
    
    print(f"\nFiles with 'unsafe-inline' in CSP ({len(unsafe_inline_files)}):")
    for f in unsafe_inline_files:
        print(f"  ✓ {f}")
    
    print("\n=== SUMMARY ===")
    print(f"Total HTML files analyzed: {len(html_files)}")
    print(f"Missing CSS files: {len(missing_css)}")
    print(f"Missing JS files: {len(missing_js)}")
    print(f"Files missing navbar placeholder: {len(missing_navbar)}")
    print(f"Files missing footer placeholder: {len(missing_footer)}")
    print(f"Files missing CSP headers: {len(no_csp_files)}")

if __name__ == "__main__":
    main()