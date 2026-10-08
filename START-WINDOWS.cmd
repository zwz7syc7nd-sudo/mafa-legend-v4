@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (py -3 launch.py %* & goto done)
where python >nul 2>nul
if not errorlevel 1 (python launch.py %* & goto done)
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" ("%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" launch.py %* & goto done)
echo Python 3 was not found. Use an existing Python 3 or Node installation.
echo For Node: node serve.cjs
:done
pause
