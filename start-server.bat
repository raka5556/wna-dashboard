@echo off
chcp 65001 >nul
title Watsurenaikatsudou Dashboard

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   Watsurenaikatsudou Activity Dashboard      ║
echo  ║   Local WiFi Server                          ║
echo  ╚══════════════════════════════════════════════╝
echo.

:: ── Step 1: Auto-add Firewall rule (needs admin) ───────────
net session >nul 2>&1
if %errorlevel%==0 (
    :: Already admin
    goto :add_firewall
) else (
    :: Ask user to confirm UAC elevation
    echo  Meminta izin Administrator untuk membuka port 8080...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:add_firewall
netsh advfirewall firewall delete rule name="WNA-Dashboard-8080" >nul 2>&1
netsh advfirewall firewall add rule ^
    name="WNA-Dashboard-8080" ^
    dir=in action=allow protocol=TCP localport=8080 ^
    profile=any >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Firewall port 8080 sudah dibuka.
) else (
    echo  [WARN] Gagal set firewall. Coba allow-firewall.bat manual.
)
echo.

:: ── Step 2: Start server ────────────────────────────────────
where node >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Menjalankan server dengan Node.js...
    echo.
    node "%~dp0server.js"
    goto :eof
)

where python >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Menjalankan server dengan Python...
    echo.
    echo  IP WiFi kamu:
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "192.168.56 192.168.80 192.168.115"') do (
        set IP=%%a
        setlocal enabledelayedexpansion
        set IP=!IP: =!
        echo     http://!IP!:8080  ^<-- buka ini di HP
        endlocal
    )
    echo.
    python -m http.server 8080 --directory "%~dp0"
    goto :eof
)

echo  [ERROR] Node.js atau Python tidak ditemukan!
echo.
echo  Install Node.js: https://nodejs.org
pause
