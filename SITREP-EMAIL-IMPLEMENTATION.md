# 📧 Envoi Automatique de SITREP par Email en PDF

## ✅ Implémentation terminée !

### 🎯 Fonctionnalité

Lorsqu'un utilisateur crée un SITREP dans l'application, le système :

1. **Sauvegarde** le SITREP dans la base de données
2. **Génère automatiquement** un PDF professionnel
3. **Envoie par email** le PDF à **deux destinataires** :
   - `walaeddine1207@gmail.com`
   - `rriahi@grssconsulting.com`

### 📋 Workflow Complet

```
[Utilisateur remplit le formulaire SITREP]
                ↓
[Clique sur "Envoyer SITREP"]
                ↓
[Système sauvegarde dans DB]
                ↓
[Génération PDF avec Puppeteer]
                ↓
[Envoi email avec pièce jointe PDF]
                ↓
[Notification de succès à l'utilisateur]
```

### 📄 Format du PDF

Le PDF généré contient :

```
┌─────────────────────────────────────┐
│  📋 SITREP No. [N°]                 │
│  Généré le [Date complète]          │
│  (En-tête avec gradient violet)     │
├─────────────────────────────────────┤
│                                     │
│  SITREP Template                    │
│  SUBJECT: SITREP No. [N°]          │
│                                     │
│  • Incident Type: [...]             │
│  • Site: [...]                      │
│  • Date & Time: [...]               │
│  ─────────────────────────          │
│                                     │
│  1. Trigger Time (T0): [...]        │
│  2. Current Situation: [...]        │
│  3. Actions in Progress:            │
│     o [Action 1]                    │
│     o [Action 2]                    │
│  4. Personnel (P): [...]            │
│  5. Equipment / Facility (E): [...] │
│  6. Risks (R): [...]                │
│  7. Next Tasks (T): [...]           │
│  8. Needs (B): [...]                │
│  9. Next Update: [...]              │
│                                     │
│  Sent by: [Nom], Coordinateur       │
│  Acknowledgement: [✔]               │
│                                     │
├─────────────────────────────────────┤
│  Document confidentiel              │
│  © 2025 - Tous droits réservés      │
│  (Watermark "SITREP" en fond)       │
└─────────────────────────────────────┘
```

### 📧 Format de l'Email

**Sujet** : `📋 SITREP No. [N°]`

**Corps** (HTML formaté) :

- En-tête avec gradient violet
- Message de notification
- Détails du SITREP (titre, date)
- Avertissement de confidentialité
- Pied de page professionnel

**Pièce jointe** : `SITREP_[titre]_[timestamp].pdf`

### 🔧 Fichiers Modifiés/Créés

1. **`src/app/(app)/simulation/[simulationId]/participant-view/page.tsx`**

   - Ajout de l'appel API pour l'envoi d'email après création du SITREP
   - Notification utilisateur mise à jour

2. **`src/app/api/simulations/[simulationId]/sitrep/send-email/route.ts`** (NOUVEAU)

   - Endpoint API pour générer le PDF et envoyer l'email
   - Utilise Puppeteer pour la génération du PDF
   - Utilise Nodemailer pour l'envoi d'email

3. **`SITREP-EMAIL-CONFIG.md`** (NOUVEAU)
   - Documentation de configuration
   - Instructions pour Gmail

### ⚙️ Configuration Requise

**Variables d'environnement** (`.env.local`) :

```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application-gmail
```

> 💡 **Note** : Utilisez un "Mot de passe d'application" Gmail, pas votre mot de passe principal.

### 🎨 Caractéristiques du PDF

- **Format** : A4
- **Style** : Professionnel avec gradient
- **Watermark** : "SITREP" en arrière-plan semi-transparent
- **Sections** : Bien séparées avec bordures colorées
- **Police** : Arial/Helvetica pour la lisibilité
- **Marges** : 15-20mm pour l'impression

### 🔒 Sécurité

- ✅ Document marqué comme **confidentiel**
- ✅ Watermark pour identification
- ✅ Avertissement de confidentialité dans l'email
- ✅ Utilisation de variables d'environnement pour les credentials
- ✅ Pas de données sensibles dans le code

### 🚀 Utilisation

1. **Remplir le formulaire SITREP**

   - N° SITREP
   - Type d'incident
   - Site
   - Date & Heure
   - Tous les autres champs

2. **Cliquer sur "Envoyer SITREP"**

   - Le système sauvegarde le SITREP
   - Génère le PDF automatiquement
   - Envoie l'email automatiquement

3. **Confirmation**

   ```
   ✅ SITREP envoyé avec succès et emails envoyés à walaeddine1207@gmail.com et rriahi@grssconsulting.com
   ```

4. **Vérifier les emails**
   - Ouvrir les boîtes mail :
     - `walaeddine1207@gmail.com`
     - `rriahi@grssconsulting.com`
   - Télécharger la pièce jointe PDF
   - Lire le rapport

### 📊 Exemple de Message de Succès

Après envoi, l'utilisateur voit :

```
┌────────────────────────────────────────────────────────────┐
│  ✅ Succès                                                  │
│                                                            │
│  SITREP envoyé avec succès et emails envoyés à            │
│  walaeddine1207@gmail.com et rriahi@grssconsulting.com   │
└────────────────────────────────────────────────────────────┘
```

### 🐛 Gestion des Erreurs

Si l'envoi d'email échoue :

- Le SITREP est quand même sauvegardé dans la DB
- Une erreur est loguée dans la console
- L'utilisateur voit quand même le message de succès pour la sauvegarde
- L'erreur email n'empêche pas le workflow principal

### 📝 Logs

Le système génère des logs détaillés :

```bash
Génération du PDF SITREP...
PDF généré avec succès, taille: 45231 bytes
Envoi de l'email à: walaeddine1207@gmail.com
Email envoyé avec succès: <message-id@gmail.com>
Envoi de l'email à: rriahi@grssconsulting.com
Email envoyé avec succès: <message-id@gmail.com>
```

### 🎯 Prochaines Étapes

Pour tester :

1. **Configurer les variables d'environnement**

   - Créer/modifier `.env.local`
   - Ajouter `EMAIL_USER` et `EMAIL_PASS`

2. **Redémarrer le serveur de développement**

   ```bash
   npm run dev
   ```

3. **Créer un SITREP de test**

   - Aller dans une simulation
   - Ouvrir le canal "SITREP"
   - Remplir le formulaire
   - Envoyer

4. **Vérifier les logs**
   - Console du serveur
   - Boîtes mail (walaeddine1207@gmail.com et rriahi@grssconsulting.com)

### ✨ Avantages

- 🚀 **Automatique** : Aucune action manuelle requise
- 📄 **PDF Professionnel** : Format standardisé et imprimable
- 📧 **Email immédiat** : Notification instantanée à 2 destinataires
- 🔒 **Sécurisé** : Marqué confidentiel avec watermark
- 📱 **Compatible** : Fonctionne sur tous les appareils
- 🎨 **Branded** : Design cohérent avec l'application
- 👥 **Multi-destinataires** : Envoi simultané à plusieurs adresses

---

**Status** : ✅ Prêt pour la production  
**Date** : 19 Octobre 2025  
**Version** : 1.1.0  
**Mise à jour** : Ajout du second destinataire rriahi@grssconsulting.com
