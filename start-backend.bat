@echo off
echo ====================================
echo Starting Risk Agent Backend
echo ====================================
echo.

cd backend
echo Building and starting Spring Boot application...
echo This may take a minute on first run...
echo.

call mvn spring-boot:run

pause
