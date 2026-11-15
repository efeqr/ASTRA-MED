@echo off
chcp 65001 >nul
echo ============================================================================
echo   ASTRA-MED: NASA Space Apps Challenge 2026
echo   Otonom Derin Uzay Astronot Saglik Izleme ve Karar Destek Sistemi
echo ============================================================================
echo.
echo Uygulama varsayilan tarayicinizda aciliyor...
start "" "%~dp0index.html"
echo.
echo [BILGI] Uygulama internet baglantisi veya ek sunucu gerektirmeden dogrudan calisir.
timeout /t 4 >nul
