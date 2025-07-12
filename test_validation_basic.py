#!/usr/bin/env python3
"""
Basic test to verify the validation system works
"""

import os
import sys
from pathlib import Path

def test_validation_system():
    """Test basic validation system functionality"""
    print("🔍 Testing doha.kr Validation System...")
    
    # Check if we're in the right directory
    current_dir = Path(".")
    print(f"📁 Current directory: {current_dir.absolute()}")
    
    # Check for validation files
    validation_files = [
        "validate_website.py",
        "PROBLEM_RESOLUTION_CHECKLIST.md", 
        "VALIDATION_GUIDE.md",
        "requirements_validation.txt",
        "setup_validation.sh",
        "setup_validation.bat"
    ]
    
    print("\n📋 Checking validation system files:")
    all_present = True
    for file_name in validation_files:
        file_path = current_dir / file_name
        if file_path.exists():
            print(f"✅ {file_name}")
        else:
            print(f"❌ {file_name} - MISSING")
            all_present = False
    
    # Check for website files to validate
    print("\n🌐 Checking website structure:")
    essential_items = [
        ("index.html", "Main homepage"),
        ("css/styles.css", "Main stylesheet"),
        ("js/main.js", "Main JavaScript"),
        ("includes/navbar.html", "Navigation component"),
        ("includes/footer.html", "Footer component")
    ]
    
    website_health = 0
    for item, description in essential_items:
        item_path = current_dir / item
        if item_path.exists():
            print(f"✅ {item} - {description}")
            website_health += 1
        else:
            print(f"❌ {item} - {description} - MISSING")
    
    # Quick HTML validation test
    print("\n🔍 Quick validation test:")
    html_files = list(current_dir.rglob("*.html"))
    print(f"📄 Found {len(html_files)} HTML files")
    
    # Test one HTML file for basic structure
    if html_files:
        test_file = html_files[0]
        print(f"🧪 Testing {test_file.relative_to(current_dir)}...")
        
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            checks = [
                ("<!DOCTYPE html>", "DOCTYPE declaration"),
                ("<html", "HTML root element"),
                ("<head>", "Head section"),
                ("<title>", "Title tag"),
                ("charset=", "Character encoding")
            ]
            
            for check, description in checks:
                if check.lower() in content.lower():
                    print(f"  ✅ {description}")
                else:
                    print(f"  ⚠️  {description} - Not found")
                    
        except Exception as e:
            print(f"  ❌ Failed to read file: {e}")
    
    # Summary
    print(f"\n📊 System Status:")
    print(f"✅ Validation system files: {'Complete' if all_present else 'Incomplete'}")
    print(f"✅ Website structure health: {website_health}/{len(essential_items)} ({website_health/len(essential_items)*100:.0f}%)")
    print(f"📄 HTML files found: {len(html_files)}")
    
    if all_present:
        print(f"\n🚀 Validation system is ready!")
        print(f"📖 Next steps:")
        print(f"   1. Run: ./setup_validation.sh (Linux/Mac) or setup_validation.bat (Windows)")
        print(f"   2. Run: python validate_website.py")
        print(f"   3. Review: VALIDATION_GUIDE.md for detailed usage")
    else:
        print(f"\n⚠️  Some validation files are missing. Please check the setup.")
    
    return all_present and website_health >= 3

if __name__ == "__main__":
    success = test_validation_system()
    sys.exit(0 if success else 1)