@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul
title Push Code to GitHub - Babyiel Store

echo ========================================================
echo         Babyiel Store - Push to GitHub Script
echo ========================================================
echo.

REM Check if git command exists
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Aplikasi Git belum terinstall di komputer Anda.
    echo.
    echo Silakan install Git for Windows terlebih dahulu:
    echo 1. Halaman Download: https://git-scm.com/download/win
    echo 2. Jalankan installer dan klik Next sampai selesai.
    echo 3. Setelah install selesai, jalankan kembali file ini.
    echo.
    echo Membuka halaman download Git di browser...
    start https://git-scm.com/download/win
    echo.
    echo Tekan sembarang tombol untuk menutup jendela ini...
    pause >nul
    exit /b 1
)

set "REPO_URL=https://github.com/memanglupa10/Store-.git"

REM Check if git is initialized
if not exist ".git" (
    echo [1/5] Inisialisasi Git Repository...
    git init
    git branch -M main
) else (
    echo [1/5] Git Repository terdeteksi.
)

REM Configure remote origin
echo [2/5] Mengatur Remote Repository: %REPO_URL%
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

REM Stage all files
echo [3/5] Menambahkan seluruh file project...
git add .

REM Input commit message
echo.
set "COMMIT_MSG="
set /p COMMIT_MSG="Masukkan pesan commit (tekan Enter untuk default 'Update Babyiel Store'): "
if "!COMMIT_MSG!"=="" set "COMMIT_MSG=Update Babyiel Store App"

REM Commit changes
echo.
echo [4/5] Melakukan Commit...
git commit -m "!COMMIT_MSG!"

REM Push to GitHub
echo.
echo [5/5] Mengunggah kode ke GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================================
    echo   Push ke branch 'main' gagal, mencoba ke branch 'master'...
    echo ========================================================
    git push -u origin master
)

REM Deploy to Vercel Production
echo.
echo [6/6] Melakukan deployment langsung ke Vercel Production...
cmd.exe /c "npx -y vercel --prod --yes"

echo.
echo ========================================================
echo   Proses Selesai!
echo   Situs Live: https://babyielstore.my.id
echo   Repository: https://github.com/memanglupa10/Store-
echo ========================================================
echo.
echo Tekan sembarang tombol untuk keluar...
pause >nul
