#!/usr/bin/env python3
"""
Fix "Invalid or unexpected token" error in HTML files
This script removes malformed CSP strings that were causing JavaScript parsing errors
"""

import os
import re
from pathlib import Path

def fix_html_file(file_path):
    """Fix invalid CSP strings in HTML file"""
    
    # Skip node_modules directory
    if 'node_modules' in str(file_path):
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to match the invalid CSP strings
        # These appear as raw strings starting with "self' https:;" outside of proper tags
        patterns = [
            # Pattern 1: CSP string after comment
            r'(<!-- Security Headers -->)\s*\n\s*self\' https:;[^<]*?">',
            # Pattern 2: CSP string after </script>
            r'(</script>)\s*\n\s*self\' https:;[^<]*?">',
            # Pattern 3: CSP string between meta tags
            r'(<meta[^>]+>)\s*\n\s*self\' https:;[^<]*?">',
        ]
        
        replacements = [
            r'\1',  # Keep only the comment
            r'\1',  # Keep only the </script>
            r'\1',  # Keep only the meta tag
        ]
        
        for pattern, replacement in zip(patterns, replacements):
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
        
        # Also remove any standalone CSP strings on their own lines
        # These are lines that start with self' and end with ">
        content = re.sub(r'^\s*self\' https:;[^<\n]*?">\s*$', '', content, flags=re.MULTILINE)
        
        if content != original_content:
            # Backup original file
            backup_path = str(file_path) + '.backup'
            if not os.path.exists(backup_path):
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original_content)
            
            # Write fixed content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"Fixed: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix all HTML files"""
    
    # Get the teste directory
    teste_dir = Path('C:/Users/pc/teste')
    
    if not teste_dir.exists():
        print("Error: teste directory not found")
        return
    
    # Find all HTML files
    html_files = []
    for root, dirs, files in os.walk(teste_dir):
        # Skip node_modules
        if 'node_modules' in root:
            continue
            
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    print(f"Found {len(html_files)} HTML files to check")
    
    fixed_count = 0
    for file_path in html_files:
        if fix_html_file(file_path):
            fixed_count += 1
    
    print(f"\nCompleted! Fixed {fixed_count} files")
    
    if fixed_count > 0:
        print("\nBackup files created with .backup extension")
        print("To restore original files, rename .backup files back to .html")

if __name__ == "__main__":
    main()