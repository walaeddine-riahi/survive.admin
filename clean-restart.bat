@echo off
echo Nettoyage complet du projet Next.js...
echo.

echo [1/5] Arret des processus Node.js...
taskkill /F /IM node.exe 2>nul
echo.

echo [2/5] Suppression du cache .next...
if exist .next rmdir /S /Q .next
echo Cache .next supprime

echo [3/5] Suppression de node_modules...
if exist node_modules rmdir /S /Q node_modules
echo node_modules supprime

echo [4/5] Suppression du lockfile...
if exist pnpm-lock.yaml del /F /Q pnpm-lock.yaml
echo pnpm-lock.yaml supprime

echo [5/5] Reinstallation des dependances...
call pnpm install
echo.

echo ===================================
echo Nettoyage termine avec succes!
echo Vous pouvez maintenant lancer: pnpm dev
echo ===================================
pause
