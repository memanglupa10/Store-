@echo off
echo ===================================================
echo 🚀 Babyiel Store Express Server starting...
echo 👉 Open Browser: http://localhost:3000
echo ===================================================
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    node "%~dp0server.js"
) else (
    echo [WARN] Node.js not found in PATH, falling back to PowerShell static server...
    powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
)
