@echo off
echo Cleaning up Electron build files...

:: Kill any running processes
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM "Strong's Dictionary Analyzer.exe" /T >nul 2>&1

:: Wait a moment
timeout /t 3 /nobreak >nul

:: Try to remove the dist-electron directory
echo Removing dist-electron directory...
rmdir /s /q "dist-electron" >nul 2>&1

:: Wait another moment
timeout /t 2 /nobreak >nul

:: Try the build
echo Starting Electron build...
npm run build
if errorlevel 1 (
    echo Vite build failed!
    pause
    exit /b 1
)

echo Building Electron app...
npx electron-builder --win --x64
if errorlevel 1 (
    echo Electron builder failed!
    pause
    exit /b 1
)

echo Build completed successfully!
pause
