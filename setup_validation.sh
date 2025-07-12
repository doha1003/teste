#!/bin/bash

# doha.kr Website Validation Setup Script

echo "🚀 Setting up doha.kr Website Validation..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv_validation" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv_validation
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv_validation/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -r requirements_validation.txt

# Make validation script executable
chmod +x validate_website.py

echo "✅ Setup complete!"
echo ""
echo "🔍 To run validation:"
echo "  source venv_validation/bin/activate"
echo "  python validate_website.py --root /path/to/website"
echo ""
echo "📊 Example usage:"
echo "  python validate_website.py --root /mnt/e/doha.kr_project_team/v1/teste_fix"
echo "  python validate_website.py --no-external  # Skip external resource checks"