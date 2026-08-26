@echo off
cd /d "%~dp0standalone"
py -m http.server 8766
if errorlevel 1 python -m http.server 8766
