@echo off
REM Resume Builder Upload Test Script (Windows)
REM ============================================
REM This script tests the complete resume upload and parsing workflow
REM
REM Prerequisites:
REM - Server running on http://127.0.0.1:3000
REM - Redis running on localhost:6379
REM - curl command available (comes with Windows 10+)
REM
REM Usage:
REM   test_upload.bat                    (basic tests only)
REM   test_upload.bat C:\path\to\resume.pdf  (with file upload test)

setlocal enabledelayedexpansion

set API_BASE_URL=http://127.0.0.1:3000
set TEST_FILE=%1
set DELAY_SECONDS=2

REM Check if file argument provided
if not "%TEST_FILE%"=="" (
    if not exist "%TEST_FILE%" (
        echo.
        echo [ERROR] Test file not found: %TEST_FILE%
        echo.
        echo Usage: test_upload.bat [path_to_resume_file]
        echo Example: test_upload.bat "C:\Users\USER\Desktop\resume.pdf"
        exit /b 1
    )
)

REM Clear screen
cls

echo.
echo ========================================
echo   Resume Builder - Upload Test Script
echo ========================================
echo.
echo Testing API: %API_BASE_URL%
echo.

REM Test 1: Server Health
echo [TEST 1] Server Health Check
echo ========================================
echo.

curl -s "%API_BASE_URL%/health" > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Server is running on %API_BASE_URL%
    echo.
    curl -s "%API_BASE_URL%/health"
    echo.
) else (
    echo [FAIL] Server is not responding on %API_BASE_URL%
    echo Please start the server: npm start (in server directory^)
    exit /b 1
)

REM Test 2: Parser Health
echo.
echo [TEST 2] Parser Health Check
echo ========================================
echo.

curl -s "%API_BASE_URL%/api/parser/health" > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Parser is running
    echo.
    curl -s "%API_BASE_URL%/api/parser/health"
    echo.
) else (
    echo [FAIL] Parser is not responding
    exit /b 1
)

REM Test 3: Queue Statistics
echo.
echo [TEST 3] Queue Statistics
echo ========================================
echo.

curl -s "%API_BASE_URL%/api/parser/stats"
echo.
echo.

REM Test 4: File Upload (if file provided)
if not "%TEST_FILE%"=="" (
    echo.
    echo [TEST 4] Resume File Upload
    echo ========================================
    echo.
    echo Uploading file: %TEST_FILE%
    echo.

    for /f "tokens=*" %%a in ('curl -s -X POST "%API_BASE_URL%/api/parser/upload" -F "file=@%TEST_FILE%" 2^>nul') do set "UPLOAD_RESPONSE=%%a"

    echo Response:
    echo !UPLOAD_RESPONSE!
    echo.

    REM Try to extract jobId (basic parsing)
    echo.
    echo [TEST 5] Job Status Polling
    echo ========================================
    echo.
    echo Note: Job status polling requires proper JSON parsing
    echo For detailed testing, use a REST client like:
    echo   - Postman
    echo   - curl with proper flags
    echo   - Your React client UI
    echo.
) else (
    echo.
    echo [SKIP] File Upload Test
    echo ========================================
    echo.
    echo No test file provided. To test file upload:
    echo   test_upload.bat "C:\path\to\resume.pdf"
    echo.
)

REM Summary
echo.
echo ========================================
echo   Test Complete
echo ========================================
echo.
echo Next steps:
echo 1. Verify all tests above show [OK] status
echo 2. If file upload worked, try your React client UI
echo 3. Upload a resume file from the client application
echo.
echo For issues:
echo - Check that Redis is running: docker exec redis-server redis-cli ping
echo - Check server logs for errors
echo - Review BUG_REPORT_AND_FIX.md for troubleshooting
echo.
pause
