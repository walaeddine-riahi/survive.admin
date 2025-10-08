# Intégration de l'envoi de SMS avec Twilio

Ce document explique comment configurer et utiliser la fonctionnalité d'envoi de SMS dans l'application en utilisant Twilio.

## Configuration requise

1. **Compte Twilio**
   - Inscrivez-vous sur [Twilio](https://www.twilio.com/)
   - Vérifiez votre numéro de téléphone et ajoutez des fonds à votre compte
   - Obtenez vos identifiants API dans le [tableau de bord Twilio](https://console.twilio.com/)

2. **Variables d'environnement**
   Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
   ```
   # Configuration Twilio (obligatoire pour l'envoi réel de SMS)
   TWILIO_ACCOUNT_SID=votre_account_sid
   TWILIO_AUTH_TOKEN=votre_auth_token
   
   # Configuration de base (obligatoire)
   NEXTAUTH_SECRET=votre_secret_securise
   DATABASE_URL=votre_url_mongodb
   
   # Configuration optionnelle
   NODE_ENV=development # ou 'production' en production
   NEXTAUTH_URL=http://localhost:3000 # URL de votre application
   ```

   > **Note** : En mode développement (`NODE_ENV=development`), vous pouvez laisser les variables Twilio vides pour simuler l'envoi de SMS sans frais.

## Utilisation

### Envoyer un SMS

Utilisez la fonction `sendSms` du service SMS :

```typescript
import { sendSms } from '@/lib/sms-service';

// Exemple d'utilisation
const result = await sendSms({
  to: '+33123456789', // Format international requis
  message: 'Votre message ici',
  // Le paramètre 'country' est optionnel et n'est plus nécessaire avec Twilio
});

if (result) {
  console.log('SMS envoyé avec succès');
} else {
  console.error('Échec de l\'envoi du SMS');
}
```

### Numéro d'expéditeur

Tous les SMS seront envoyés depuis le numéro Twilio configuré : **+1 570 755 4683**

Pour changer ce numéro, modifiez la propriété `fromNumber` dans le fichier `src/lib/twilio-service.ts`.

### Valider un numéro de téléphone

```typescript
import { validatePhoneNumber, isPhoneNumberValid } from '@/lib/sms-service';

// Validation complète
const validation = await validatePhoneNumber('+33123456789', 'FR');
console.log(validation);
// {
//   isValid: true,
//   internationalFormat: '+33123456789',
//   localFormat: '01 23 45 67 89',
//   countryCode: 'FR',
//   countryName: 'France',
//   carrier: 'Orange'
// }

// Validation simple
const isValid = await isPhoneNumberValid('+33123456789', 'FR');
console.log(isValid); // true ou false
```

## Fonctionnement en développement

En mode développement (`NODE_ENV=development`) :
- Si les identifiants Twilio ne sont pas configurés, les appels à l'API sont simulés
- Les SMS ne sont pas réellement envoyés, mais les appels sont enregistrés dans la console
- La validation des numéros de téléphone est simulée mais suit le format international

## Déploiement en production

1. Assurez-vous que `NODE_ENV=production`
2. Configurez vos identifiants Twilio valides
3. Vérifiez que les variables d'environnement sont correctement définies
4. Activez la vérification 2FA sur votre compte Twilio pour plus de sécurité
5. Configurez les alertes de crédit dans votre tableau de bord Twilio

## Dépannage

### Erreurs courantes

- **Identifiants Twilio manquants** : Vérifiez que `TWILIO_ACCOUNT_SID` et `TWILIO_AUTH_TOKEN` sont correctement définis
- **Numéro invalide** : Assurez-vous que le numéro est au format international (ex: +33123456789)
- **Problème de connexion** : Vérifiez votre connexion Internet et les paramètres de pare-feu
- **Crédits insuffisants** : Vérifiez votre solde sur le tableau de bord Twilio
- **Pays non pris en charge** : Certains pays peuvent être restreints par Twilio

### Logs

Les erreurs sont enregistrées dans la console du navigateur (côté client) et dans les logs du serveur (côté API).
