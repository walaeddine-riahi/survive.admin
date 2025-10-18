# 📧 Configuration de l'Envoi d'Emails pour les SITREPs

## ❌ Problème : "Je ne reçois pas les emails"

Si vous ne recevez pas les emails SITREP, c'est probablement parce que les variables d'environnement ne sont pas configurées.

## ✅ Solution : Configuration en 3 étapes

### Étape 1 : Créer un mot de passe d'application Gmail

1. **Allez sur** : https://myaccount.google.com/security
2. **Activez la validation en deux étapes** (si ce n'est pas déjà fait)
3. **Allez dans "Mots de passe des applications"** (tout en bas de la page)
4. **Sélectionnez** :
   - Application : `Autre (nom personnalisé)`
   - Nom : `Système SITREP`
5. **Cliquez sur "Générer"**
6. **Copiez** le mot de passe de 16 caractères (format : `xxxx xxxx xxxx xxxx`)

⚠️ **IMPORTANT** : N'utilisez JAMAIS votre mot de passe Gmail normal !

### Étape 2 : Configurer le fichier `.env.local`

1. **Ouvrez** le fichier `.env.local` à la racine du projet
2. **Remplacez** les valeurs :

```env
# Votre adresse Gmail
EMAIL_USER=votre-email@gmail.com

# Le mot de passe d'application (16 caractères, SANS espaces)
EMAIL_PASS=xxxxxxxxxxxxxxxx
```

**Exemple de configuration valide** :

```env
EMAIL_USER=prenetflix99@gmail.com
EMAIL_PASS=abcdwxyzabcdwxyz
```

### Étape 3 : Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

## 🧪 Test de la Configuration

1. **Démarrez** le serveur : `npm run dev`
2. **Vérifiez les logs** au démarrage - vous NE devez PAS voir :
   ```
   Les variables d'environnement EMAIL_USER et EMAIL_PASS sont requises
   ```
3. **Créez un SITREP** dans l'application
4. **Observez les notifications** :
   - ✅ "SITREP créé avec succès. Les emails PDF sont en cours d'envoi..."
   - ✅ "Emails envoyés" (après quelques secondes)
   - ❌ Si erreur : vérifiez les logs de la console

## 📝 Vérification des Logs

### Dans le terminal du serveur, vous devriez voir :

```
Génération du PDF SITREP...
PDF généré avec succès, taille: 12345 bytes
Envoi de l'email à: walaeddine1207@gmail.com
Email envoyé avec succès: <message-id>
Envoi de l'email à: rriahi@grssconsulting.com
Email envoyé avec succès: <message-id>
```

### Si vous voyez des erreurs :

#### Erreur : "Les variables d'environnement EMAIL_USER et EMAIL_PASS sont requises"

➡️ **Solution** : Le fichier `.env.local` n'existe pas ou est mal nommé

- Créez le fichier `.env.local` (avec le point au début)
- Vérifiez qu'il est à la racine du projet (même niveau que `package.json`)

#### Erreur : "Invalid login: 535-5.7.8 Username and Password not accepted"

➡️ **Solution** : Mot de passe incorrect

- Utilisez un **mot de passe d'application**, pas votre mot de passe Gmail
- Retirez tous les espaces du mot de passe dans `.env.local`
- Vérifiez que la validation en deux étapes est activée

#### Erreur : "self signed certificate in certificate chain"

➡️ **Solution** : Problème SSL (déjà géré dans le code avec `rejectUnauthorized: false`)

## 📧 Destinataires actuels

Les emails SITREP sont envoyés automatiquement à :

- ✉️ walaeddine1207@gmail.com
- ✉️ rriahi@grssconsulting.com

Pour modifier ces adresses, éditez le fichier :
`src/app/(app)/simulation/[simulationId]/participant-view/page.tsx`

Ligne ~1040 :

```typescript
const recipients = ["walaeddine1207@gmail.com", "rriahi@grssconsulting.com"];
```

## 🔒 Sécurité

- ✅ Le fichier `.env.local` est dans `.gitignore` - il ne sera JAMAIS commité
- ✅ Les mots de passe d'application sont spécifiques et révocables
- ✅ Si compromis, révoquez-le sur https://myaccount.google.com/security
- ⚠️ Ne partagez JAMAIS votre `.env.local`

## 🆘 Aide Supplémentaire

Si le problème persiste :

1. Vérifiez la console du navigateur (F12) pour les erreurs
2. Vérifiez les logs du serveur terminal
3. Testez avec un autre compte Gmail
4. Vérifiez que Gmail n'a pas bloqué l'accès (https://myaccount.google.com/notifications)

---

**Date de création** : 19 octobre 2025
**Dernière mise à jour** : 19 octobre 2025
