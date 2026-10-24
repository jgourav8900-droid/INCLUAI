@echo off
title INCLUAI Backend Server Gateway
cd /d "%~dp0\server"
echo ========================================================
echo   Starting INCLUAI Backend Gateway on http://localhost:5000
echo ========================================================
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Launching Node.js Express server...
node server.js
pause
