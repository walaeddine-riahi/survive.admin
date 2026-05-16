# Nouvelles variables d'environnement — Simulation v2

À ajouter dans `.env.local` (développement) et dans Vercel (production).

## Pusher — WebSocket temps réel
> Créer un compte gratuit sur https://pusher.com (Channels)
> Le free tier est suffisant pour le développement

```env
PUSHER_APP_ID=votre_app_id
PUSHER_KEY=votre_key
PUSHER_SECRET=votre_secret
PUSHER_CLUSTER=eu

NEXT_PUBLIC_PUSHER_KEY=votre_key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

## URL de l'application (pour les webhooks Twilio)
```env
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
# En local avec ngrok : https://xxxx.ngrok.io
```

## Twilio — Déjà configuré, vérifiez que ces variables existent
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

## Webhooks Twilio à configurer dans la console Twilio
Après déploiement, configurez ces URLs dans https://console.twilio.com :

- **Voice URL** : POST `https://votre-domaine.com/api/simulation/twilio/voice`
- **SMS URL** : POST `https://votre-domaine.com/api/simulation/twilio/sms`
- **Status Callback** : POST `https://votre-domaine.com/api/simulation/twilio/status`

## Mode dégradé sans Pusher
Si `NEXT_PUBLIC_PUSHER_KEY` n'est pas configuré, la plateforme bascule automatiquement
en polling toutes les **3 secondes**. Tout fonctionne, avec 3s de latence au lieu de <100ms.
L'interface affiche `(polling)` discrètement.
