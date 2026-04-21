@echo off
chcp 65001 >nul
title WNA Dashboard — Public Tunnel

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   Watsurenaikatsudou Activity Dashboard              ║
echo  ║   Public Tunnel — Akses dari HP / Data Paket         ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: ── Cek Node.js ──────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js tidak ditemukan. Install di https://nodejs.org
    pause & exit /b 1
)

:: ── Cek ngrok ────────────────────────────────────────────────
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] ngrok tidak ditemukan.
    echo.
    echo  Cara install:
    echo    1. Download di https://ngrok.com/download
    echo    2. Extract ngrok.exe ke folder ini atau ke C:\Windows\System32
    echo    3. Daftar gratis di https://ngrok.com lalu jalankan:
    echo       ngrok config add-authtoken TOKEN_KAMU
    echo.
    pause & exit /b 1
)

:: ── Firewall ─────────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel%==0 (
    netsh advfirewall firewall delete rule name="WNA-Dashboard-8080" >nul 2>&1
    netsh advfirewall firewall add rule ^
        name="WNA-Dashboard-8080" ^
        dir=in action=allow protocol=TCP localport=8080 ^
        profile=any >nul 2>&1
    echo  [OK] Firewall port 8080 sudah dibuka.
) else (
    echo  [WARN] Jalankan sebagai Administrator agar firewall otomatis terbuka.
)
echo.

:: ── Matikan ngrok lama jika ada ─────────────────────────────
taskkill /IM ngrok.exe /F >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Ngrok lama dihentikan.
    timeout /t 1 /nobreak >nul
)

:: ── Matikan sisa proses server lama jika ada ─────────────────
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
)

:: ── Mulai server di window terpisah ──────────────────────────
echo  [1/2] Menjalankan server lokal (port 8080)...
start "WNA Server" cmd /k "chcp 65001 >nul && node "%~dp0server.js""

:: ── Tunggu server siap ───────────────────────────────────────
echo  [..] Menunggu server siap...
timeout /t 3 /nobreak >nul

:: ── Cek server benar-benar sudah jalan ───────────────────────
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
)

:: ── Mulai ngrok tunnel ───────────────────────────────────────
echo  [2/2] Membuat tunnel publik dengan ngrok...
echo.
echo  ════════════════════════════════════════════════════════
echo   Setelah ngrok berjalan, cari baris:
echo.
echo     Forwarding   https://xxxx.ngrok-free.app -> ...
echo.
echo   Salin URL tersebut dan buka di HP (WiFi apa saja / data paket)
echo  ════════════════════════════════════════════════════════
echo.

ngrok http 8080 --log=stdout

echo.
echo  [INFO] Tunnel dihentikan. Server mungkin masih berjalan di window lain.
pause
