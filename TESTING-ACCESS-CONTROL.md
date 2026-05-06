# 🧪 Guide de Test du Contrôle d'Accès par Rôle

## Préalables

Assurez-vous que la base de données est seedée avec:

```bash
npx prisma db push
npx prisma db seed
```

## 👤 Comptes de Test

### Compte ADMIN

- **Email** : admin@survive.tn
- **Mot de passe** : Admin@123456

### Compte PARTICIPANT (USER)

- **Email** : participant@survive.tn
- **Mot de passe** : Participant@123456

## ✅ Scénarios de Test

### Test 1: Accès Admin - Routes Réservées

#### 1.1. Login en tant qu'ADMIN

```
1. Aller à http://localhost:3000/connection
2. Entrer: admin@survive.tn / Admin@123456
3. Cliquer sur "Se connecter"
```

✅ **Attendu**: Redirigé vers home/dashboard admin

#### 1.2. Accès à `/admin`

```
1. Naviguer à http://localhost:3000/admin
```

✅ **Attendu**: Page admin accessible

#### 1.3. Accès à `/factories`

```
1. Naviguer à http://localhost:3000/factories
```

✅ **Attendu**: Page factories accessible

#### 1.4. Accès à `/plan`

```
1. Naviguer à http://localhost:3000/plan
```

✅ **Attendu**: Page plans accessible

---

### Test 2: Accès Admin - Opérations de Création

#### 2.1. Créer une Simulation (API)

```bash
curl -X POST http://localhost:3000/api/simulations \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "title": "Test Simulation",
    "description": "Test Description",
    "startDate": "2024-04-10T10:00:00Z",
    "endDate": "2024-04-10T15:00:00Z",
    "status": "planned",
    "assignments": []
  }'
```

✅ **Attendu**: Simulation créée (200/201)
❌ **Non-admin**: Erreur 403 "Accès refusé"

#### 2.2. Créer un Plan (API)

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "name": "Test Plan",
    "description": "Test",
    "startDate": "2024-04-10",
    "endDate": "2024-04-20",
    "status": "active",
    "typeId": "..."
  }'
```

✅ **Attendu**: Plan créé (200/201)
❌ **Non-admin**: Erreur 403 "Accès refusé"

---

### Test 3: Accès PARTICIPANT - Restrictions

#### 3.1. Login en tant qu'UTILISATEUR

```
1. Logout du compte admin (si connecté)
2. Aller à http://localhost:3000/connection
3. Entrer: participant@survive.tn / Participant@123456
4. Cliquer sur "Se connecter"
```

✅ **Attendu**: Redirigé vers `/participant-mode`

#### 3.2. Accès interdit à `/admin`

```
1. Naviguer à http://localhost:3000/admin
```

❌ **Attendu**: Automatiquement redirigé vers `/participant-mode`

#### 3.3. Accès interdit à `/factories`

```
1. Naviguer à http://localhost:3000/factories
```

❌ **Attendu**: Automatiquement redirigé vers `/participant-mode`

#### 3.4. Accès interdit à `/plan`

```
1. Naviguer à http://localhost:3000/plan
```

❌ **Attendu**: Automatiquement redirigé vers `/participant-mode`

#### 3.5. Accès autorisé à `/participant-mode`

```
1. Naviguer à http://localhost:3000/participant-mode
```

✅ **Attendu**: Page du mode participant affichée

#### 3.6. Tentative de création (API - Route POST)

```bash
curl -X POST http://localhost:3000/api/simulations \
  -H "Content-Type: application/json" \
  -H "Cookie: [participant-auth-cookie]" \
  -d '{
    "title": "Test Simulation",
    "description": "Test",
    "startDate": "2024-04-10T10:00:00Z",
    "endDate": "2024-04-10T15:00:00Z",
    "status": "planned",
    "assignments": []
  }'
```

❌ **Attendu**: Erreur 403 "Accès refusé - Réservé aux administrateurs"

---

### Test 4: Accès Participant - Routes Autorisées

#### 4.1. Accès à `/participant-view/[simulationId]`

```
1. Aller à http://localhost:3000/participant-view/[valid-simulation-id]
```

✅ **Attendu**: Vue de la simulation accessible

#### 4.2. Accès à `/simulation`

```
1. Naviguer à http://localhost:3000/simulation
```

✅ **Attendu**: Liste des simulations accessible

#### 4.3. Accès à `/notifications`

```
1. Naviguer à http://localhost:3000/notifications
```

✅ **Attendu**: Page notifications accessible

#### 4.4. Accès à `/profile`

```
1. Naviguer à http://localhost:3000/profile
```

✅ **Attendu**: Profil utilisateur accessible

---

### Test 5: Vérification du Token JWT

#### 5.1. Inspexion du JWT (DevTools > Application > Cookies)

```javascript
// Dans la console du navigateur
const token = document.cookie
  .split("; ")
  .find((c) => c.startsWith("next-auth"))
  .split("=")[1];
// Décoder: https://jwt.io/
```

✅ **Attendu**: Le payload contient `"role": "ADMIN"` ou `"role": "USER"`

---

## 🔧 Dépannage

### Problème: Redirection constante vers `/participant-mode`

**Cause possible**: Le rôle n'est pas correctement stocké dans le token JWT

**Solution**:

1. Vérifiez que `authOptions` dans `src/lib/auth.ts` inclut `role` dans le JWT
2. Vérifiez le callback `jwt()`:

```typescript
async jwt({ token, user }) {
  if (user) {
    token.role = user.role;
  }
  return token;
}
```

### Problème: 401 Unauthorized sur les routes API

**Cause possible**: Le cookie d'authentification n'est pas envoyé

**Solution**: Assurez-vous que les requêtes fetch incluent les credentials:

```javascript
fetch("/api/simulations", {
  credentials: "include", // Important!
});
```

### Problème: Erreur 403 avec compte admin

**Cause possible**: Le rôle ADMIN n'est pas correctement assigné dans la base de données

**Solution**:

```bash
# Vérifier l'utilisateur dans la DB
npx prisma studio
# Allez à User table et vérifiez que role = "ADMIN"
```

---

## 📝 Checklist de Validation

- [ ] Admin peut accéder à `/admin`
- [ ] Admin peut accéder à `/factories`, `/plan`, `/incident`, etc.
- [ ] Admin peut créer une simulation (POST /api/simulations)
- [ ] Admin peut créer un plan (POST /api/plans)
- [ ] Admin peut créer un incident (POST /api/incidents)
- [ ] Participant est redirigé loin de `/admin`
- [ ] Participant est redirigé loin de `/factories`
- [ ] Participant reçoit 403 sur POST /api/simulations
- [ ] Participant peut accéder à `/participant-mode`
- [ ] Participant peut accéder à `/participant-view/[id]`
- [ ] Participant peut accéder à `/simulation`
- [ ] JWT contient le rôle correct

---

## 🚀 Prochaines Étapes

1. Implémenter des tests automatisés pour valider le RBAC
2. Ajouter des logs pour tracer les tentatives d'accès non autorisé
3. Mettre en place des alertes de sécurité
4. Tester avec d'autres rôles si ajoutés (ex: INSTRUCTOR, MODERATOR)
