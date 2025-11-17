@echo off
cls
echo ========================================
echo   SURVIVE.ADMIN
echo   Redemarrage Complet du Serveur
echo ========================================
echo.

echo [Etape 1/4] Arret du serveur...
echo IMPORTANT: Allez dans votre terminal actif
echo et appuyez sur Ctrl+C pour arreter le serveur
echo.
echo Puis revenez ici et appuyez sur une touche...
pause
echo.

echo [Etape 2/4] Nettoyage du cache Next.js...
if exist ".next" (
    echo Suppression du dossier .next...
    rmdir /s /q .next 2>nul
    if exist ".next" (
        echo ⚠ Echec de suppression, essayez manuellement
    ) else (
        echo ✓ Cache Next.js nettoye avec succes
    )
) else (
    echo ℹ Pas de cache .next a nettoyer
)
echo.

echo [Etape 3/4] Instructions pour le navigateur...
echo.
echo ⚠ IMPORTANT - A faire quand vous ouvrirez le navigateur:
echo.
echo   1. Ouvrez http://localhost:3000
echo   2. Appuyez sur Ctrl+Shift+R (force le rechargement)
echo   3. Ou bien: F12 ^> Onglet Network ^> Cocher "Disable cache"
echo.
echo Appuyez sur une touche quand vous etes pret...
pause
echo.

echo [Etape 4/4] Demarrage du serveur de developpement...
echo.
echo ========================================
echo   SERVEUR EN COURS DE DEMARRAGE...
echo ========================================
echo.
echo Le serveur va demarrer. Patientez...
echo.
echo Une fois "ready" affiche, ouvrez:
echo   👉 http://localhost:3000
echo.
echo ========================================
echo   CE QUE VOUS DEVRIEZ VOIR
echo ========================================
echo.
echo Dans la sidebar (menu de gauche):
echo.
echo   ┌─────────────────────────────┐
echo   │ 🏠 Dashboard                │
echo   │                             │
echo   │ 🎮 Simulation          ▼   │
echo   │   └─ Liste simulations      │
echo   │   └─ Creer simulation       │
echo   │   └─ Scenarios              │
echo   │   └─ Injections             │
echo   │   └─ Mode Participant       │
echo   │   └─ Participations         │
echo   │                             │
echo   │ 🎓 Instructeur         ▼   │
echo   │   └─ Vue Instructeur        │
echo   │   └─ Gestion equipes        │
echo   │   └─ ...                    │
echo   │                             │
echo   │ 📊 BIA                 ▼   │
echo   │   └─ Dashboard BIA          │
echo   │   └─ ...                    │
echo   │                             │
echo   │ 📚 Workshop            ▼   │
echo   │   └─ Formations             │
echo   │   └─ ...                    │
echo   └─────────────────────────────┘
echo.
echo Si vous ne voyez pas cette structure:
echo   1. Verifiez que le serveur a demarre
echo   2. Videz le cache (Ctrl+Shift+R)
echo   3. Consultez TROUBLESHOOTING.md
echo.
echo ========================================
echo.
echo Pour arreter le serveur: Ctrl+C
echo.

pnpm dev
