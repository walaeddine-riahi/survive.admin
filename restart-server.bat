@echo off
echo.
echo ===================================================
echo   REDEMARRAGE DU SERVEUR AVEC VERIFICATION EMAIL
echo ===================================================
echo.

REM Vérifier la configuration
echo [1/3] Verification de la configuration email...
node test-email-config.js

echo.
echo [2/3] Arret des serveurs Node.js existants...
taskkill /F /IM node.exe >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo [3/3] Demarrage du serveur avec les nouvelles variables...
echo.
echo ^>^>^> Le serveur va demarrer. Verifiez les logs ci-dessous.
echo ^>^>^> Si vous voyez "✅ Configuration email valide", c'est bon !
echo ^>^>^> Si vous voyez "❌ Variables d'environnement manquantes", il y a un probleme.
echo.
echo ===================================================
echo.

npm run dev
