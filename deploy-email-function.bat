@echo off
echo ========================================
echo   Deploiement de la fonction email
echo ========================================
echo.

echo 1. Connexion a Supabase...
npx supabase login

echo.
echo 2. Liaison du projet...
npx supabase link --project-ref anyzqzhjvankvbbajahj

echo.
echo 3. Configuration des variables d'environnement...
echo IMPORTANT: Remplacez la clé API dans config.env avant de continuer
pause

echo.
echo 4. Deploiement de la fonction...
npx supabase functions deploy send-email

echo.
echo ========================================
echo   Deploiement termine !
echo ========================================
echo.
echo Pour tester, ouvrez votre application et essayez d'envoyer un email.
pause 