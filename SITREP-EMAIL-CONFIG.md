# Configuration Email pour l'envoi automatique de SITREP

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application
```

## Configuration Gmail

Pour utiliser Gmail avec Nodemailer, vous devez créer un "Mot de passe d'application" :

1. Allez sur votre compte Google : https://myaccount.google.com/
2. Sécurité → Validation en deux étapes (activez-la si ce n'est pas déjà fait)
3. Sécurité → Mots de passe des applications
4. Créez un nouveau mot de passe d'application pour "Mail"
5. Copiez le mot de passe généré (16 caractères)
6. Utilisez ce mot de passe dans `EMAIL_PASS`

## Fonctionnement

Lorsqu'un SITREP est créé :

1. Le SITREP est sauvegardé dans la base de données
2. Un PDF professionnel est automatiquement généré avec Puppeteer
3. Un email est envoyé à `walaeddine1207@gmail.com` avec :
   - Un email HTML formaté avec les informations du SITREP
   - Le PDF en pièce jointe

## Structure du PDF

Le PDF généré contient :

- En-tête avec gradient professionnel
- Titre du SITREP
- Date et heure de génération
- Contenu complet du SITREP formaté
- Pied de page avec mentions légales
- Watermark "SITREP" en arrière-plan

## API Endpoint

**POST** `/api/simulations/[simulationId]/sitrep/send-email`

**Body:**

```json
{
  "title": "SITREP No. 001",
  "content": "Contenu complet du SITREP...",
  "recipientEmail": "walaeddine1207@gmail.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "SITREP envoyé par email avec succès",
  "messageId": "..."
}
```

## Dépendances

- `nodemailer` : Pour l'envoi d'emails
- `puppeteer` : Pour la génération de PDF
- `dotenv` : Pour charger les variables d'environnement

Toutes ces dépendances sont déjà installées dans le projet.

## Test

Pour tester l'envoi d'email :

1. Configurez vos variables d'environnement
2. Créez un SITREP dans l'interface
3. Vérifiez votre console pour les logs d'envoi
4. Vérifiez la boîte mail de `walaeddine1207@gmail.com`

## Sécurité

⚠️ **Important** :

- Ne jamais committer le fichier `.env.local`
- Utiliser des mots de passe d'application Gmail (pas votre mot de passe principal)
- Le fichier `.env.local` est déjà dans `.gitignore`
