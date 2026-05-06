# 🔐 Mise à jour du Contrôle d'Accès - Survive Admin

## 📋 Résumé des Changements

Cette mise à jour implémente un système complet de contrôle d'accès basé sur les rôles (RBAC) pour séparer les **administrateurs** des **participants** (utilisateurs réguliers).

### Changements Clés

#### 1. **Middleware Amélioré** (`src/middleware.ts`)

- Routes admin réservées aux utilisateurs avec rôle `ADMIN`
- Redirection automatique des non-admins vers `/participant-mode`
- Routes accessibles aux participants : simulations, participations, notifications, profil

#### 2. **Protection des Routes API**

- `POST /api/simulations` - Admin uniquement ✅
- `POST /api/incidents` - Admin uniquement ✅
- `POST /api/plans` - Admin uniquement ✅
- Erreur 403 si l'utilisateur n'est pas administrateur

#### 3. **Fonction Utilitaire** (`src/lib/role-protection.ts`)

- `requireAuth()` - Vérifier l'authentification
- `requireAdmin()` - Vérifier le rôle admin
- `errorResponse()` - Formater les réponses d'erreur

#### 4. **Séquence de Données** (`prisma/seed.ts`)

Utilisateurs par défaut mis à jour:

**Admin**:

- Email: `admin@survive.tn`
- Password: `Admin@123456`
- Accès: Complet

**Participant**:

- Email: `participant@survive.tn`
- Password: `Participant@123456`
- Accès: Mode participant uniquement

#### 5. **Corrections Prisma**

- Renommé `teamMembers` → `teams` partout dans le code
- Corrigé erreur TypeScript dans `tsconfig.json` (moduleResolution)

## 🚀 Installation et Test

### Étape 1: Mettre à jour la base de données

```bash
npx prisma db push
npx prisma db seed
```

### Étape 2: Redémarrer l'application

```bash
npm run dev
```

### Étape 3: Tester avec les comptes

#### Test Admin

1. Allez à `http://localhost:3000/connection`
2. Connectez-vous: `admin@survive.tn` / `Admin@123456`
3. Vous devriez avoir accès à `/admin`, `/factories`, `/plan`, etc.

#### Test Participant

1. Allez à `http://localhost:3000/connection`
2. Connectez-vous: `participant@survive.tn` / `Participant@123456`
3. Vous serez redirigé vers `/participant-mode`
4. Les routes admin retourneront une erreur 403 en API

## 📚 Documentation

- **`ROLE-BASED-ACCESS-CONTROL.md`** - Documentation détaillée du système RBAC
- **`TESTING-ACCESS-CONTROL.md`** - Guide complet de test avec scénarios

## 🔍 Routes Protégées - Récapitulatif

### Admin Uniquement (Frontend)

```
/admin
/factories
/plan
/plan-type
/risk
/scenario
/incident
/report
/bia
/bia-form
/compliance
/conformity
/training
/task
/injections
/instructor-simulations
```

### Admin Uniquement (API)

```
POST /api/simulations
POST /api/incidents
POST /api/plans
```

### Accessible Participants

```
/participant-mode
/participant-view/[simulationId]
/simulation
/participations
/notifications
/profile
/settings
/team-members
/team-chat
/dashboard
```

## ⚙️ Configuration

### Ajouter une nouvelle route protégée

**Pour le frontend:**

```typescript
// src/middleware.ts
const adminOnlyPaths = [
  // ... autres routes
  "/ma-nouvelle-route-admin",
];
```

**Pour l'API:**

```typescript
import { requireAdmin } from "@/lib/role-protection";

export async function POST(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) {
    return new NextResponse(error, { status: 401 || 403 });
  }

  // Votre logique ici
}
```

## 🛡️ Bonnes Pratiques Sécurité

1. **Jamais faire confiance au frontend** - Toujours vérifier le rôle côté serveur
2. **Logs d'accès** - Enregistrer les tentatives d'accès non autorisé
3. **JWT sécurisé** - Utiliser `httpOnly` cookies (NextAuth le fait)
4. **Mots de passe forts** - Changer les identifiants par défaut avant production
5. **Audit régulier** - Vérifier les droits d'accès périodiquement

## 🐛 Troubleshooting

### Le middleware ne redirige pas

- Vérifiez que `/middleware.ts` est à la racine de `src/`
- Redémarrez l'application complètement
- Videz le cache du navigateur

### Erreur 403 inattendue

- Vérifiez le rôle dans la base de données: `npx prisma studio`
- Assurez-vous que `session.user.role` est défini dans `auth.ts`
- Vérifiez les logs du serveur

### Les participants ne voient pas les données

- Vérifiez que les routes GET ne sont pas protégées (sauf si nécessaire)
- Les participants doivent pouvoir lire les données, juste pas les modifier

## 📞 Support

Pour des questions ou problèmes:

1. Consultez `TESTING-ACCESS-CONTROL.md`
2. Vérifiez `ROLE-BASED-ACCESS-CONTROL.md`
3. Inspectez les logs du serveur
4. Testez avec `npx prisma studio`

---

**Dernier update**: Avril 2026
**Versiĵn**: 1.0
