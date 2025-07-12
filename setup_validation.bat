@echo off
REM doha.kr Website Validation Setup Script for Windows

echo 🚀 Setting up doha.kr Website Validation...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv_validation" (
    echo 📦 Creating virtual environment...
    python -m venv venv_validation
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv_validation\Scripts\activate.bat

REM Install requirements
echo 📥 Installing dependencies...
pip install -r requirements_validation.txt

echo ✅ Setup complete!
echo.
echo 🔍 To run validation:
echo   venv_validation\Scripts\activate.bat
echo   python validate_website.py --root C:\path\to\website
echo.
echo 📊 Example usage:
echo   python validate_website.py --root .
echo   python validate_website.py --no-external
echo.
pause