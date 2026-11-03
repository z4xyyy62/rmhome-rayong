@echo off
chcp 65001 > nul
title RMHome Rayong - Online Tunnel
echo ========================================================
echo   RMHome Rayong (สร้างบ้านระยอง)
echo   ระบบเปิดเว็บออนไลน์ผ่าน Localtunnel
echo   URL: https://rmhome-rayong.loca.lt
echo ========================================================
echo.
echo [1/2] กำลังเริ่ม Web Server (Port 3000)...
start /b "" python -m http.server 3000 > nul 2>&1

echo [2/2] กำลังเชื่อมต่อ Tunnel: https://rmhome-rayong.loca.lt ...
echo.
echo * หมายเหตุ: อย่าเพิ่งปิดหน้าต่างนี้ หากปิดหน้าต่าง เว็บจะเข้าไม่ได้ทันที
echo * หากหน้าเว็บ loca.lt มีช่องให้กรอกรหัส (Tunnel Password / Endpoint IP):
echo   สามารถดูรหัส IP ได้ที่ลิงก์นี้: https://loca.lt/mytunnelpassword
echo.
npx.cmd --yes localtunnel --port 3000 --subdomain rmhome-rayong
pause

