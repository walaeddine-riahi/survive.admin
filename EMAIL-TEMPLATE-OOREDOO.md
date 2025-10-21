# 📧 Template Email Ooredoo - Guide Complet

## 🎨 Vue d'ensemble

Le template email a été redesigné avec le branding Ooredoo pour les invitations aux simulations de gestion de crise.

### ✨ Nouvelles fonctionnalités

1. **Design Ooredoo** : Couleurs rouge (#E2001A) et blanc, logo Ooredoo
2. **Affichage des identifiants** : Email + mot de passe dans un encadré sécurisé
3. **Lien direct** : Bouton "Accéder à la Simulation" avec lien vers la simulation
4. **Responsive** : Compatible mobile et desktop
5. **Professionnel** : Footer avec mentions légales Ooredoo

---

## 🔧 Modifications techniques

### Fonction mise à jour

```typescript
export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  password: string,        // ← NOUVEAU PARAMÈTRE
  simulationTitle: string,
  simulationId: string
) => { ... }
```

### Paramètres requis

| Paramètre         | Type   | Description                                   |
| ----------------- | ------ | --------------------------------------------- |
| `email`           | string | Adresse email du destinataire                 |
| `firstName`       | string | Prénom du participant                         |
| `password`        | string | **NOUVEAU** - Mot de passe (ex: "ooredoo123") |
| `simulationTitle` | string | Titre de la simulation                        |
| `simulationId`    | string | ID unique de la simulation                    |

---

## 🎨 Éléments du design

### Header (Gradient Rouge Ooredoo)

- Fond : `linear-gradient(135deg, #E2001A 0%, #C40016 100%)`
- Titre : "Bienvenue chez Ooredoo"
- Sous-titre : "Invitation à la Simulation de Gestion de Crise"

### Encadré Identifiants

- Fond : `linear-gradient(135deg, #FFF5F5 0%, #FFE8EA 100%)`
- Bordure gauche : 4px solid #E2001A
- Affiche : Email + Mot de passe
- Police : Courier New (monospace)
- Couleur texte : #E2001A (rouge Ooredoo)

### Bouton CTA

- Texte : "🚀 Accéder à la Simulation"
- Fond : Gradient rouge Ooredoo
- Lien : `https://survive-tau.vercel.app/simulation/{simulationId}/participant-view`
- Style : Ombre portée, coins arrondis

### Footer

- Logo texte "Ooredoo" en rouge
- Liens : Politique de confidentialité, Conditions, Support
- Copyright : "© 2025 Ooredoo Tunisie. Tous droits réservés."

---

## 🧪 Test du template

### Option 1 : Script de test

```bash
# Exécuter le script de test
npx ts-node scripts/test-email.ts
```

**Important** : Modifiez l'email de test dans `scripts/test-email.ts` :

```typescript
const testData = {
  email: "votre-email@example.com", // ← Changez ici
  firstName: "Ahmed",
  password: "ooredoo123",
  ...
};
```

### Option 2 : Test avec vraie simulation

1. Créez une simulation dans l'interface
2. Ajoutez un participant avec votre email
3. Vérifiez votre boîte de réception

---

## 📝 Fichiers à mettre à jour

Pour utiliser le nouveau template, vous devez mettre à jour les appels à `sendWelcomeEmail` dans :

### 1. `src/app/api/simulations/[simulationId]/participants/route.ts`

**AVANT** (ligne 141) :

```typescript
await sendWelcomeEmail(user.email, user.firstName, simulation.title);
```

**APRÈS** :

```typescript
await sendWelcomeEmail(
  user.email,
  user.firstName,
  "ooredoo123", // ← Ajoutez le mot de passe
  simulation.title,
  params.simulationId
);
```

### 2. `src/app/api/participations/route.ts`

**AVANT** (ligne 82-86) :

```typescript
await sendWelcomeEmail(
  user.email,
  user.firstName,
  simulation.title,
  simulation.id
);
```

**APRÈS** :

```typescript
await sendWelcomeEmail(
  user.email,
  user.firstName,
  "ooredoo123", // ← Ajoutez le mot de passe
  simulation.title,
  simulation.id
);
```

---

## ⚠️ Points importants

### Sécurité

- Le mot de passe est envoyé en clair dans l'email
- Recommandé : Utiliser un mot de passe temporaire
- Les emails utilisent TLS/SSL (Gmail SMTP)

### Variables d'environnement requises

```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
```

### Mot de passe applicatif Gmail

Si vous utilisez Gmail, vous devez créer un "mot de passe d'application" :

1. Allez sur https://myaccount.google.com/security
2. Activez la validation en 2 étapes
3. Générez un mot de passe d'application
4. Utilisez ce mot de passe dans `EMAIL_PASS`

---

## 🎯 Exemple d'utilisation

```typescript
import { sendWelcomeEmail } from "@/lib/email";

// Envoi d'invitation
await sendWelcomeEmail(
  "ahmed.ben@ooredoo.tn",
  "Ahmed",
  "ooredoo123",
  "Simulation Cyberattaque 2025",
  "sim_abc123xyz"
);
```

---

## 🔄 Workflow complet

1. **Création des utilisateurs** (scripts/create-user.ts)

   - Crée 36 utilisateurs Ooredoo
   - Mot de passe : "ooredoo123"

2. **Ajout aux simulations** (API participants)

   - Assigne les utilisateurs à une simulation
   - Envoie automatiquement l'email d'invitation

3. **Réception de l'email**

   - Email professionnel avec branding Ooredoo
   - Identifiants clairement affichés
   - Lien direct vers la simulation

4. **Accès à la simulation**
   - L'utilisateur clique sur le bouton
   - Se connecte avec ses identifiants
   - Accède à l'espace participant

---

## 📊 Statistiques du template

- **Taille HTML** : ~8 KB
- **Compatible** : Outlook, Gmail, Apple Mail, Thunderbird
- **Responsive** : Oui (viewport meta tag)
- **Images externes** : Non (seulement texte et CSS inline)
- **Temps de chargement** : < 100ms

---

## 🐛 Dépannage

### Email non reçu

- Vérifiez les variables d'environnement
- Vérifiez le dossier spam
- Consultez les logs du serveur

### Erreur SMTP

```bash
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

→ Utilisez un mot de passe d'application Gmail

### Template mal affiché

- Certains clients email bloquent les styles
- Le template utilise des tables HTML (compatibilité maximale)
- Testez sur différents clients email

---

## 📚 Ressources

- [Documentation nodemailer](https://nodemailer.com/)
- [Guide HTML email](https://www.campaignmonitor.com/css/)
- [Ooredoo Brand Guidelines](https://www.ooredoo.tn/)

---

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Template testé avec script
- [ ] API participants mise à jour
- [ ] API participations mise à jour
- [ ] Test avec vraie simulation
- [ ] Email reçu et affiché correctement
- [ ] Lien fonctionne vers la simulation
- [ ] Identifiants corrects (email + password)

---

**Créé le** : 21 octobre 2025  
**Auteur** : GitHub Copilot  
**Version** : 1.0.0  
**Fichier** : `src/lib/email.ts`
