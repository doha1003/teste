# doha.kr Website Validation Guide

## 🎯 Overview

This validation system provides automated checking for all common issues identified in the doha.kr project. It prevents recurring problems and ensures consistent quality.

## 📦 Quick Setup

### Linux/Mac
```bash
chmod +x setup_validation.sh
./setup_validation.sh
```

### Windows
```batch
setup_validation.bat
```

### Manual Setup
```bash
python3 -m venv venv_validation
source venv_validation/bin/activate  # Linux/Mac
# OR
venv_validation\Scripts\activate.bat  # Windows

pip install -r requirements_validation.txt
```

## 🔍 Usage

### Basic Validation
```bash
# Activate environment
source venv_validation/bin/activate  # Linux/Mac
# OR
venv_validation\Scripts\activate.bat  # Windows

# Run validation on current directory
python validate_website.py

# Run validation on specific directory
python validate_website.py --root /path/to/website

# Skip external resource checks (faster)
python validate_website.py --no-external
```

### Example Commands
```bash
# Validate the actual doha.kr project
python validate_website.py --root /mnt/e/doha.kr_project_team/v1/teste_fix

# Quick validation without external checks
python validate_website.py --no-external --root .

# Validate and save detailed report
python validate_website.py > validation_output.txt
```

## 📊 Understanding Results

### Output Format
- ✅ **Green**: Tests passed - everything is working correctly
- ⚠️ **Yellow**: Warnings - issues that should be addressed but won't break the site
- ❌ **Red**: Errors - critical issues that will cause problems

### Report Categories

#### `[HTML]` - HTML File Issues
- Missing or incorrect file references
- Parsing errors
- Structure problems

#### `[CSS]` - CSS System Issues
- Missing CSS files
- Import statement problems
- Class name conflicts

#### `[JS]` - JavaScript Issues
- Missing JavaScript files
- Function definition problems
- Component loading failures

#### `[COMPONENT]` - Component System Issues
- Missing component files
- Placeholder problems
- Loading mechanism failures

#### `[CSP]` - Content Security Policy Issues
- Missing or incorrect CSP headers
- Blocked inline styles/scripts

#### `[META]` - Meta Tag Issues
- Missing essential meta tags
- SEO optimization problems

#### `[STRUCTURE]` - File Structure Issues
- Missing directories
- File organization problems

#### `[EXTERNAL]` - External Resource Issues
- CDN availability
- Third-party service connectivity

### Sample Output
```
🚀 Starting doha.kr Website Validation
📁 Root directory: /path/to/website

📁 Validating File Structure...
✅ [STRUCTURE] Essential directory exists: css
✅ [STRUCTURE] Essential directory exists: js
❌ [STRUCTURE] Essential directory missing: includes

🔍 Validating HTML Files...
✅ [CSS] index.html: CSS file exists: css/styles.css
❌ [CSS] about/index.html: CSS file not found: css/missing.css
⚠️  [COMPONENT] index.html: Missing navbar-placeholder

📊 Validation Report
✅ Passed: 15
⚠️  Warnings: 3
❌ Errors: 2
```

## 🛠️ Fixing Common Issues

### CSS 404 Errors (Priority: P0)
```bash
# Error: CSS file not found: css/missing.css
# Fix: Create the missing file or update the HTML reference
```

### Missing Component Placeholders (Priority: P1)
```html
<!-- Add to HTML files -->
<div id="navbar-placeholder"></div>
<!-- page content -->
<div id="footer-placeholder"></div>
```

### CSP Blocking Issues (Priority: P0)
```html
<!-- Add to <head> section -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               script-src 'self' 'unsafe-inline';">
```

### Component Loading Failures (Priority: P1)
```javascript
// Ensure main.js has proper component loading
document.addEventListener('DOMContentLoaded', function() {
    loadNavbar();
    loadFooter();
});

function loadNavbar() {
    fetch('/includes/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
        })
        .catch(error => console.error('Navbar load error:', error));
}
```

## 🔄 Integration with Development Workflow

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
python validate_website.py --no-external
if [ $? -ne 0 ]; then
    echo "❌ Validation failed. Fix issues before committing."
    exit 1
fi
```

### CI/CD Integration
```yaml
# Example GitHub Actions
- name: Validate Website
  run: |
    python validate_website.py --root .
    if [ $? -ne 0 ]; then
      echo "Validation failed"
      exit 1
    fi
```

### Local Development
```bash
# Add to package.json scripts
"scripts": {
  "validate": "python validate_website.py",
  "validate-quick": "python validate_website.py --no-external"
}
```

## 📈 Automation Tips

### Regular Validation
```bash
# Create a cron job for regular validation
0 9 * * * cd /path/to/project && python validate_website.py --no-external
```

### IDE Integration
Most IDEs can run the validation script as an external tool:

**VS Code**: Add to tasks.json
```json
{
    "label": "Validate Website",
    "type": "shell",
    "command": "python",
    "args": ["validate_website.py"],
    "group": "test"
}
```

## 🐛 Troubleshooting

### Common Setup Issues

#### Python Not Found
```bash
# Install Python 3
sudo apt install python3 python3-pip  # Ubuntu/Debian
brew install python3                   # macOS
```

#### Permission Denied
```bash
chmod +x validate_website.py
chmod +x setup_validation.sh
```

#### Missing Dependencies
```bash
pip install --upgrade pip
pip install -r requirements_validation.txt
```

### Common Validation Issues

#### False Positives
Some warnings may be acceptable in certain contexts:
- External resource failures during local development
- Missing optional meta tags
- Non-critical CSS imports

#### Slow External Checks
Use `--no-external` flag for faster validation during development.

#### Large Projects
For very large projects, consider validating specific directories:
```bash
python validate_website.py --root ./src/pages
```

## 📝 Customization

### Adding Custom Checks
Modify `validate_website.py` to add project-specific validations:

```python
def validate_custom_requirements(self):
    """Add your custom validation logic here"""
    # Example: Check for required custom attributes
    html_files = list(self.root_dir.rglob("*.html"))
    for html_file in html_files:
        # Your custom validation logic
        pass
```

### Configuring Thresholds
Adjust validation strictness by modifying the error/warning thresholds in the script.

## 🎯 Best Practices

1. **Run Before Every Commit**: Catch issues early
2. **Use in CI/CD**: Prevent broken deployments
3. **Regular Audits**: Run comprehensive validation weekly
4. **Team Training**: Ensure all team members understand the output
5. **Keep Updated**: Add new checks as issues are discovered

## 📞 Support

For issues with the validation script:
1. Check this guide for common solutions
2. Review the detailed JSON report generated
3. Check console output for specific error messages
4. Verify all dependencies are correctly installed

Remember: This tool helps prevent issues but doesn't replace manual testing and code review!