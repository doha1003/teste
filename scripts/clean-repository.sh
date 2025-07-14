#!/bin/bash

# GitHub Repository Cleanup Script
# This script removes unnecessary files and directories from the repository

set -e

echo "🧹 Starting repository cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# List of directories to remove
dirs_to_remove=(
    "backup"
    "teste_fix"
    "css-backup-20250712"
)

# List of file patterns to remove
files_to_remove=(
    "*.old"
    "*.bak"
    "*.temp"
    "*.orig"
    "*-old.html"
    "*-backup.css"
    "test.txt"
)

# Remove unnecessary directories
print_status "Removing unnecessary directories..."
for dir in "${dirs_to_remove[@]}"; do
    if [ -d "$dir" ]; then
        print_warning "Removing directory: $dir"
        git rm -rf "$dir" 2>/dev/null || rm -rf "$dir"
    fi
done

# Remove unnecessary files
print_status "Removing unnecessary files..."
for pattern in "${files_to_remove[@]}"; do
    files=$(find . -name "$pattern" -type f ! -path "./.git/*" 2>/dev/null || true)
    if [ ! -z "$files" ]; then
        echo "$files" | while read -r file; do
            print_warning "Removing file: $file"
            git rm "$file" 2>/dev/null || rm -f "$file"
        done
    fi
done

# Remove empty directories
print_status "Removing empty directories..."
find . -type d -empty ! -path "./.git/*" -delete 2>/dev/null || true

# Clean git cache
print_status "Cleaning git cache..."
git rm -r --cached . >/dev/null 2>&1 || true
git add .

# Show what will be kept
print_status "Files to be kept:"
git ls-files | grep -E "(\.html|\.css|\.js|\.json|\.md|\.yml|\.txt)$" | grep -v -E "(backup|teste_fix|old|temp|css-backup)" | sort | head -20

# Count remaining files
total_files=$(git ls-files | wc -l)
html_files=$(git ls-files | grep "\.html$" | wc -l)
css_files=$(git ls-files | grep "\.css$" | wc -l)
js_files=$(git ls-files | grep "\.js$" | wc -l)

echo ""
echo "📊 Repository Statistics After Cleanup:"
echo "   Total files: $total_files"
echo "   HTML files: $html_files"
echo "   CSS files: $css_files"
echo "   JS files: $js_files"

echo ""
print_status "Repository cleanup completed!"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git status"
echo "2. Commit with: git commit -m 'Clean up repository'"
echo "3. Push with: git push origin master --force-with-lease"