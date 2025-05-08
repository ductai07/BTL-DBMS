@echo off
ECHO Starting Cinema Management System...
ECHO ===================================

ECHO.
ECHO Step 1: Starting Backend Server (Port 3000)
ECHO -------------------------------------------
start cmd /k "cd backend && npm start"

ECHO.
ECHO Step 2: Starting Frontend Application (Port 5173)
ECHO ------------------------------------------------
start cmd /k "cd front_end && npm run dev"

ECHO.
ECHO Applications starting...
ECHO Backend will be available at http://localhost:3000
ECHO Frontend will be available at http://localhost:5173

ECHO.
ECHO Note: Close all command windows to stop the applications
ECHO. 