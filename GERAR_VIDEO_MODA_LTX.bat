@echo off
setlocal
title Gerar video de moda LTX
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0gerar_video_moda_ltx.ps1" "%~1"
echo.
pause
