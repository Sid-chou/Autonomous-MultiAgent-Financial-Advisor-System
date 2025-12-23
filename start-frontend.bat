@echo off
echo ====================================
echo Starting Risk Agent Frontend
echo ====================================
echo.

cd frontend

echo Installing dependencies (first time only)...
if not exist node_modules (
    call npm install
)

echo.
echo Starting React development server...
call npm start

pause
