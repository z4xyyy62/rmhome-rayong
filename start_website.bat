@echo off
chcp 65001 > nul
echo ========================================================
echo   RMHome Rayong (สร้างบ้านระยอง) - Local Web Server
echo ========================================================
echo กำลังเปิดเว็บไซต์ RMHome ที่ http://localhost:3000 ...
start "" "http://localhost:3000"
python -m http.server 3000
pause
