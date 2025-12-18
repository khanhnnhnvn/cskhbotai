@echo off
echo ==========================================
echo       GIT AUTO PUSH SCRIPT
echo ==========================================

REM Change to script directory to ensure we act on the repo
cd /d "%~dp0"

REM Get current date and time
set datetime=%date% %time%

REM Set commit message (using quotes to handle spaces safely in assignment)
set "msg=Update %datetime%"

echo.
echo [1/3] Adding changes...
git add .

echo.
echo [2/3] Committing...
git commit -m "%msg%"

echo.
echo [3/3] Pushing to origin...
git push

echo.
echo ==========================================
echo       HOAN THANH!
echo ==========================================
pause
