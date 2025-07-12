#!/usr/bin/env python3
"""
doha.kr Website Validation Script
Automated checker for all items in the Problem Resolution Checklist
"""

import os
import re
import json
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import cssutils
from colorama import init, Fore, Style

# Initialize colorama for colored output
init()

class WebsiteValidator:
    def __init__(self, root_dir="."):
        self.root_dir = Path(root_dir)
        self.errors = []
        self.warnings = []
        self.passes = []
        
    def log_error(self, category, message):
        self.errors.append(f"[{category}] {message}")
        print(f"{Fore.RED}❌ [{category}] {message}{Style.RESET_ALL}")
    
    def log_warning(self, category, message):
        self.warnings.append(f"[{category}] {message}")
        print(f"{Fore.YELLOW}⚠️  [{category}] {message}{Style.RESET_ALL}")
    
    def log_pass(self, category, message):
        self.passes.append(f"[{category}] {message}")
        print(f"{Fore.GREEN}✅ [{category}] {message}{Style.RESET_ALL}")

    def validate_html_files(self):
        """Validate all HTML files for common issues"""
        print(f"\n{Fore.CYAN}🔍 Validating HTML Files...{Style.RESET_ALL}")
        
        html_files = list(self.root_dir.rglob("*.html"))
        
        for html_file in html_files:
            self._validate_single_html(html_file)
    
    def _validate_single_html(self, html_file):
        """Validate a single HTML file"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                soup = BeautifulSoup(content, 'html.parser')
        except Exception as e:
            self.log_error("HTML", f"Failed to parse {html_file}: {e}")
            return
        
        rel_path = html_file.relative_to(self.root_dir)
        
        # Check CSS links
        self._check_css_links(soup, html_file, rel_path)
        
        # Check JavaScript references
        self._check_js_references(soup, html_file, rel_path)
        
        # Check component placeholders
        self._check_component_placeholders(soup, rel_path)
        
        # Check CSP headers
        self._check_csp_headers(soup, rel_path)
        
        # Check meta tags
        self._check_meta_tags(soup, rel_path)
        
        # Check for common class name issues
        self._check_class_consistency(soup, rel_path)
    
    def _check_css_links(self, soup, html_file, rel_path):
        """Check CSS link validity"""
        css_links = soup.find_all('link', rel='stylesheet')
        
        for link in css_links:
            href = link.get('href')
            if not href:
                self.log_error("CSS", f"{rel_path}: CSS link missing href attribute")
                continue
            
            # Skip external URLs
            if href.startswith('http'):
                continue
            
            # Resolve relative path
            css_path = html_file.parent / href if not href.startswith('/') else self.root_dir / href.lstrip('/')
            
            if not css_path.exists():
                self.log_error("CSS", f"{rel_path}: CSS file not found: {href}")
            else:
                self.log_pass("CSS", f"{rel_path}: CSS file exists: {href}")
    
    def _check_js_references(self, soup, html_file, rel_path):
        """Check JavaScript reference validity"""
        js_scripts = soup.find_all('script', src=True)
        
        for script in js_scripts:
            src = script.get('src')
            if not src:
                continue
            
            # Skip external URLs (we'll check them separately)
            if src.startswith('http'):
                continue
            
            # Resolve relative path
            js_path = html_file.parent / src if not src.startswith('/') else self.root_dir / src.lstrip('/')
            
            if not js_path.exists():
                self.log_error("JS", f"{rel_path}: JavaScript file not found: {src}")
            else:
                self.log_pass("JS", f"{rel_path}: JavaScript file exists: {src}")
    
    def _check_component_placeholders(self, soup, rel_path):
        """Check for required component placeholders"""
        required_placeholders = ['navbar-placeholder', 'footer-placeholder']
        
        for placeholder_id in required_placeholders:
            if not soup.find(id=placeholder_id):
                self.log_warning("COMPONENT", f"{rel_path}: Missing {placeholder_id}")
            else:
                self.log_pass("COMPONENT", f"{rel_path}: Found {placeholder_id}")
    
    def _check_csp_headers(self, soup, rel_path):
        """Check Content Security Policy headers"""
        csp_meta = soup.find('meta', attrs={'http-equiv': 'Content-Security-Policy'})
        
        if not csp_meta:
            self.log_warning("CSP", f"{rel_path}: No CSP meta tag found")
            return
        
        content = csp_meta.get('content', '')
        
        # Check for common CSP requirements
        if "'unsafe-inline'" not in content:
            self.log_warning("CSP", f"{rel_path}: CSP missing 'unsafe-inline' directive")
        else:
            self.log_pass("CSP", f"{rel_path}: CSP includes 'unsafe-inline'")
    
    def _check_meta_tags(self, soup, rel_path):
        """Check essential meta tags"""
        required_meta = {
            'charset': soup.find('meta', charset=True),
            'viewport': soup.find('meta', attrs={'name': 'viewport'}),
            'description': soup.find('meta', attrs={'name': 'description'})
        }
        
        for meta_type, meta_tag in required_meta.items():
            if not meta_tag:
                self.log_warning("META", f"{rel_path}: Missing {meta_type} meta tag")
            else:
                self.log_pass("META", f"{rel_path}: Found {meta_type} meta tag")
        
        # Check title tag
        title = soup.find('title')
        if not title or not title.text.strip():
            self.log_warning("META", f"{rel_path}: Missing or empty title tag")
        else:
            self.log_pass("META", f"{rel_path}: Title tag present")
    
    def _check_class_consistency(self, soup, rel_path):
        """Check for common class name inconsistencies"""
        # Known problematic class pairs
        problematic_pairs = [
            ('nav-links', 'nav-menu'),
            ('navbar-nav', 'nav-list'),
            ('btn-primary', 'button-primary')
        ]
        
        for class1, class2 in problematic_pairs:
            has_class1 = soup.find(class_=class1) is not None
            has_class2 = soup.find(class_=class2) is not None
            
            if has_class1 and has_class2:
                self.log_warning("CSS", f"{rel_path}: Mixed class naming: {class1} and {class2}")

    def validate_css_system(self):
        """Validate CSS file system"""
        print(f"\n{Fore.CYAN}🎨 Validating CSS System...{Style.RESET_ALL}")
        
        # Check core CSS files
        core_css_files = ['css/styles.css', 'css/base.css', 'css/layout.css', 'css/components.css']
        
        for css_file in core_css_files:
            css_path = self.root_dir / css_file
            if not css_path.exists():
                self.log_error("CSS-CORE", f"Core CSS file missing: {css_file}")
            else:
                self.log_pass("CSS-CORE", f"Core CSS file exists: {css_file}")
                self._validate_css_content(css_path)
    
    def _validate_css_content(self, css_path):
        """Validate CSS file content"""
        try:
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
            
            # Check for @import statements
            imports = re.findall(r'@import\s+["\']([^"\']+)["\'];?', css_content)
            for import_file in imports:
                import_path = css_path.parent / import_file
                if not import_path.exists():
                    self.log_error("CSS-IMPORT", f"Imported CSS file not found: {import_file}")
            
            # Check for common issues
            if '.nav-links' in css_content and '.nav-menu' in css_content:
                self.log_warning("CSS-NAMING", f"{css_path.name}: Contains both .nav-links and .nav-menu")
            
        except Exception as e:
            self.log_error("CSS-PARSE", f"Failed to parse {css_path}: {e}")

    def validate_component_system(self):
        """Validate component loading system"""
        print(f"\n{Fore.CYAN}🧩 Validating Component System...{Style.RESET_ALL}")
        
        # Check component files
        component_files = ['includes/navbar.html', 'includes/footer.html']
        
        for component_file in component_files:
            component_path = self.root_dir / component_file
            if not component_path.exists():
                self.log_error("COMPONENT", f"Component file missing: {component_file}")
            else:
                self.log_pass("COMPONENT", f"Component file exists: {component_file}")
        
        # Check main.js for component loading
        main_js = self.root_dir / 'js/main.js'
        if main_js.exists():
            self._validate_component_loader(main_js)
        else:
            self.log_warning("COMPONENT", "main.js not found - component loading may not work")
    
    def _validate_component_loader(self, main_js_path):
        """Validate component loading JavaScript"""
        try:
            with open(main_js_path, 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            # Check for component loading functions
            required_functions = ['loadNavbar', 'loadFooter']
            for func in required_functions:
                if func in js_content:
                    self.log_pass("JS-COMPONENT", f"Found {func} function in main.js")
                else:
                    self.log_warning("JS-COMPONENT", f"Missing {func} function in main.js")
            
            # Check for error handling
            if 'catch' in js_content or '.catch(' in js_content:
                self.log_pass("JS-ERROR", "Error handling found in component loader")
            else:
                self.log_warning("JS-ERROR", "No error handling in component loader")
                
        except Exception as e:
            self.log_error("JS-PARSE", f"Failed to parse main.js: {e}")

    def validate_file_structure(self):
        """Validate overall file structure"""
        print(f"\n{Fore.CYAN}📁 Validating File Structure...{Style.RESET_ALL}")
        
        # Check essential directories
        essential_dirs = ['css', 'js', 'includes']
        for dir_name in essential_dirs:
            dir_path = self.root_dir / dir_name
            if not dir_path.exists():
                self.log_error("STRUCTURE", f"Essential directory missing: {dir_name}")
            else:
                self.log_pass("STRUCTURE", f"Essential directory exists: {dir_name}")
        
        # Check for common files
        common_files = ['index.html', 'css/styles.css', 'js/main.js']
        for file_name in common_files:
            file_path = self.root_dir / file_name
            if not file_path.exists():
                self.log_error("STRUCTURE", f"Common file missing: {file_name}")
            else:
                self.log_pass("STRUCTURE", f"Common file exists: {file_name}")

    def check_external_resources(self):
        """Check external resource availability (optional)"""
        print(f"\n{Fore.CYAN}🌐 Checking External Resources...{Style.RESET_ALL}")
        
        # Common external resources to check
        external_resources = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
        ]
        
        for resource in external_resources:
            try:
                response = requests.head(resource, timeout=5)
                if response.status_code == 200:
                    self.log_pass("EXTERNAL", f"External resource accessible: {resource}")
                else:
                    self.log_warning("EXTERNAL", f"External resource issue: {resource} (Status: {response.status_code})")
            except Exception as e:
                self.log_warning("EXTERNAL", f"External resource check failed: {resource} ({e})")

    def generate_report(self):
        """Generate validation report"""
        print(f"\n{Fore.MAGENTA}📊 Validation Report{Style.RESET_ALL}")
        print(f"{Fore.GREEN}✅ Passed: {len(self.passes)}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}⚠️  Warnings: {len(self.warnings)}{Style.RESET_ALL}")
        print(f"{Fore.RED}❌ Errors: {len(self.errors)}{Style.RESET_ALL}")
        
        # Save detailed report
        report = {
            'summary': {
                'passed': len(self.passes),
                'warnings': len(self.warnings),
                'errors': len(self.errors)
            },
            'passed': self.passes,
            'warnings': self.warnings,
            'errors': self.errors
        }
        
        report_file = self.root_dir / 'validation_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: {report_file}")
        
        # Return exit code
        return 0 if len(self.errors) == 0 else 1

    def run_full_validation(self):
        """Run complete validation suite"""
        print(f"{Fore.CYAN}🚀 Starting doha.kr Website Validation{Style.RESET_ALL}")
        print(f"📁 Root directory: {self.root_dir.absolute()}")
        
        self.validate_file_structure()
        self.validate_html_files()
        self.validate_css_system()
        self.validate_component_system()
        self.check_external_resources()
        
        return self.generate_report()

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate doha.kr website for common issues')
    parser.add_argument('--root', default='.', help='Root directory of the website')
    parser.add_argument('--no-external', action='store_true', help='Skip external resource checks')
    
    args = parser.parse_args()
    
    validator = WebsiteValidator(args.root)
    
    if args.no_external:
        # Run validation without external checks
        validator.validate_file_structure()
        validator.validate_html_files()
        validator.validate_css_system()
        validator.validate_component_system()
        exit_code = validator.generate_report()
    else:
        exit_code = validator.run_full_validation()
    
    exit(exit_code)

if __name__ == '__main__':
    main()