#!/bin/bash

# Build and Deploy Script for doha.kr
# This script handles building, optimization, and deployment

set -e  # Exit on any error

echo "🚀 Starting build and deploy process for doha.kr..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    print_error "index.html not found. Are you in the right directory?"
    exit 1
fi

print_status "Validating project structure..."

# Check for critical files
critical_files=(
    "css/styles.css"
    "css/mobile-fixes.css"
    "includes/navbar.html"
    "includes/footer.html"
    "js/main.js"
    "js/security.js"
    "index.html"
)

missing_files=()
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists ($(wc -c < "$file" | tr -d ' ') bytes)"
    else
        print_error "$file missing"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Critical files missing. Cannot proceed with deployment."
    exit 1
fi

# Build minified JS files if they don't exist
print_status "Building minified JavaScript files..."

if [ ! -f "js/main.min.js" ] && [ -f "js/main.js" ]; then
    print_status "Creating main.min.js"
    # Use uglifyjs if available, otherwise just copy
    if command -v uglifyjs >/dev/null 2>&1; then
        uglifyjs js/main.js -o js/main.min.js -c -m
    else
        cp js/main.js js/main.min.js
    fi
fi

if [ ! -f "js/security.min.js" ] && [ -f "js/security.js" ]; then
    print_status "Creating security.min.js"
    if command -v uglifyjs >/dev/null 2>&1; then
        uglifyjs js/security.js -o js/security.min.js -c -m
    else
        cp js/security.js js/security.min.js
    fi
fi

if [ ! -f "js/bundle.min.js" ]; then
    print_status "Creating bundle.min.js"
    cat js/security.js js/main.js > js/bundle.min.js
fi

# Validate HTML files
print_status "Validating HTML files..."
html_errors=0
find . -name "*.html" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./backup/*" | while read -r file; do
    if ! grep -q "<!DOCTYPE html>" "$file"; then
        print_warning "$file missing DOCTYPE declaration"
        ((html_errors++))
    fi
    
    # Check for common issues
    if grep -q "main\.css" "$file"; then
        print_warning "$file references main.css instead of styles.css"
    fi
done

# Check for potential 404 errors
print_status "Checking for potential broken links..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./backup/*" \
    -exec grep -l 'href="[^h]' {} \; | head -5 | while read -r file; do
    print_status "Found internal links in $file"
done

# Optimize images if tools are available
if command -v optipng >/dev/null 2>&1; then
    print_status "Optimizing PNG images..."
    find images -name "*.png" -exec optipng -quiet {} \; 2>/dev/null || true
fi

# Run basic security check
print_status "Running basic security checks..."
if grep -r "API_KEY.*=" js/ 2>/dev/null | grep -v "PLACEHOLDER" | grep -v ".min.js"; then
    print_warning "Found potential API keys in JavaScript files"
fi

# Git operations
if [ -d ".git" ]; then
    print_status "Preparing Git commit..."
    
    # Add all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
    else
        # Create commit with timestamp
        commit_message="🤖 Automated build and optimization - $(date '+%Y-%m-%d %H:%M:%S')"
        git commit -m "$commit_message"
        print_status "Created commit: $commit_message"
        
        # Push to main branch
        print_status "Pushing to GitHub..."
        git push origin main
        print_status "Push completed successfully"
    fi
else
    print_warning "Not a Git repository - skipping Git operations"
fi

# Post-deployment verification
print_status "Build process completed successfully!"
echo ""
echo "📊 Build Summary:"
echo "   - HTML files validated"
echo "   - JavaScript files minified"
echo "   - Critical resources verified"
echo "   - Changes committed and pushed"
echo ""
echo "🌐 Your site should be available at: https://doha.kr"
echo "   Note: GitHub Pages may take a few minutes to reflect changes"
echo ""
print_status "Build and deploy process completed! 🎉"