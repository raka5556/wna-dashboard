@echo off
:: Request Administrator elevation automatically
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo.
echo  Membuka port 8080 di Windows Firewall...
echo.

netsh advfirewall firewall delete rule name="Watsurenaikatsudou Dashboard Port 8080" >nul 2>&1

netsh advfirewall firewall add rule ^
  name="Watsurenaikatsudou Dashboard Port 8080" ^
  dir=in action=allow protocol=TCP localport=8080 ^
  profile=private,domain

if %errorlevel%==0 (
    echo.
    echo  [OK] Port 8080 berhasil dibuka!
    echo.
    echo  IP WiFi kamu:
    ipconfig | findstr /i "IPv4"
    echo.
    echo  Buka di HP: http://^<alamat Wi-Fi di atas^>:8080
    echo  Sekarang jalankan start-server.bat lalu buka di HP.
) else (
    echo  [ERROR] Gagal membuka firewall.
)

echo.
pause
