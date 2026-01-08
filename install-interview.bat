@echo off
echo Installing AI Interview Feature...
echo.

echo [1/4] Installing backend dependencies...
cd services\interview
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    exit /b 1
)

echo [2/4] Installing frontend dependencies...
cd ..\..\frontend
call npm install @vapi-ai/web uuid @types/uuid
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    exit /b 1
)

echo [3/4] Building interview service...
cd ..\services\interview
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build interview service
    exit /b 1
)

echo [4/4] Setup complete!
echo.
echo Next steps:
echo 1. Configure environment variables in services/interview/.env
echo 2. Set up Vapi AI credentials in frontend/.env.local
echo 3. Configure Google Gemini API key
echo 4. Start the interview service: npm run dev
echo.
echo Documentation: services/interview/README.md
pause