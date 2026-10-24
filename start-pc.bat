@echo off
cd /d "%~dp0"
where node >nul 2>&1 || (echo Can cai Node.js tai https://nodejs.org roi chay lai & pause & exit /b)
node serve.mjs
