#!/usr/bin/env python3
"""
Fix duplicate CSS links in HTML files.
Removes duplicate /css/styles.css references, keeping only the first one.
"""

import os
import re
from pathlib import Path

def fix_duplicate_css(file_path):
    """Fix duplicate CSS links in a single HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match link tags for styles.css
        pattern = r'<link\s+[^>]*href=["\']/?css/styles\.css[^"\']*["\'][^>]*>'
        
        # Find all matches
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        
        if len(matches) > 1:
            print(f"\n{file_path}:")
            print(f"  Found {len(matches)} instances of styles.css")
            
            # Keep track of which one to keep (prefer one with version parameter)
            keep_index = 0
            for i, match in enumerate(matches):
                if '?v=' in match.group():
                    keep_index = i
                    break
            
            # Remove duplicates (keeping the selected one)
            new_content = content
            removed_count = 0
            
            for i in range(len(matches) - 1, -1, -1):
                if i != keep_index:
                    start = matches[i].start()
                    end = matches[i].end()
                    
                    # Also remove the newline after the tag if it exists
                    if end < len(content) and content[end] == '\n':
                        end += 1
                    
                    new_content = new_content[:start] + new_content[end:]
                    removed_count += 1
                    print(f"  Removed: {matches[i].group()}")
                else:
                    print(f"  Kept: {matches[i].group()}")
            
            # Write the fixed content back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"  ✓ Fixed! Removed {removed_count} duplicate(s)")
            return True
        else:
            return False
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all files."""
    # List of files to check
    files_to_check = [
        'about/index.html',
        'contact/index.html',
        'faq/index.html',
        'tests/index.html',
        'tools/index.html',
        'tools/text-counter.html',
        'tools/bmi-calculator.html',
        'tools/salary-calculator.html'
    ]
    
    print("CSS Duplicate Link Fixer")
    print("=" * 50)
    
    fixed_count = 0
    checked_count = 0
    
    for file_path in files_to_check:
        full_path = Path(file_path)
        if full_path.exists():
            checked_count += 1
            if fix_duplicate_css(full_path):
                fixed_count += 1
        else:
            print(f"\n⚠️  File not found: {file_path}")
    
    print("\n" + "=" * 50)
    print(f"Summary: Checked {checked_count} files, fixed {fixed_count} files")
    
    # Verify the changes
    print("\n" + "=" * 50)
    print("Verification - Current CSS link counts:")
    for file_path in files_to_check:
        full_path = Path(file_path)
        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            pattern = r'<link\s+[^>]*href=["\']/?css/styles\.css[^"\']*["\'][^>]*>'
            matches = re.findall(pattern, content, re.IGNORECASE)
            print(f"{file_path}: {len(matches)} styles.css link(s)")

if __name__ == "__main__":
    main()