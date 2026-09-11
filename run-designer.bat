@echo off
rem Usage: run-designer.bat [port]
rem   no arg   -> starts on 8766, or auto-picks the next free port if 8766 is busy
rem   with arg -> forces that port (e.g. run-designer.bat 8767)
if "%~1"=="" (
  node "%~dp0launch-designer.mjs" %*
) else (
  node "%~dp0launch-designer.mjs" --port %~1 %*
)
