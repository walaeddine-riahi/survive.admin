@echo off
echo ========================================
echo   SURVIVE.ADMIN - Test Navigation
echo ========================================
echo.

echo [1/5] Verification des fichiers modifies...
if exist "src\components\navigation.tsx" (
    echo ✓ navigation.tsx existe
) else (
    echo ✗ navigation.tsx manquant
)

if exist "src\components\main-nav.tsx" (
    echo ✓ main-nav.tsx existe
) else (
    echo ✗ main-nav.tsx manquant
)
echo.

echo [2/5] Nettoyage du cache Next.js...
if exist ".next" (
    rmdir /s /q .next
    echo ✓ Cache .next supprime
) else (
    echo ℹ Pas de cache a supprimer
)
echo.

echo [3/5] Verification de pnpm...
where pnpm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ pnpm est installe
) else (
    echo ✗ pnpm n'est pas installe
    echo.
    echo Installez pnpm avec: npm install -g pnpm
    pause
    exit /b
)
echo.

echo [4/5] Installation des dependances...
echo Cela peut prendre quelques minutes...
call pnpm install
echo.

echo [5/5] Demarrage du serveur de developpement...
echo.
echo ========================================
echo   Serveur pret sur http://localhost:3000
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Ouvrez http://localhost:3000 dans votre navigateur
echo 2. Appuyez sur Ctrl+Shift+R pour vider le cache
echo 3. Vous devriez voir la nouvelle navigation en 4 modules
echo.
echo Pour arreter le serveur: Ctrl+C
echo.

call pnpm dev
