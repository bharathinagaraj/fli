@echo off
chcp 65001 >nul
title FLI - Backend Data Viewer
echo ==============================================
echo   FLI BACKEND DATA VIEWER  (double-click file)
echo ==============================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0view-data.ps1"
echo.
echo ==============================================
echo   Press any key to close this window...
echo ==============================================
pause >nul
