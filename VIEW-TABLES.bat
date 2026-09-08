@echo off
chcp 65001 >nul
title FLI - All Created Tables
echo ==============================================
echo   FLI TABLE VIEWER  (double-click file)
echo   Shows every created table + columns + rows
echo ==============================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0view-tables.ps1"
echo.
echo ==============================================
echo   Press any key to close this window...
echo ==============================================
pause >nul
