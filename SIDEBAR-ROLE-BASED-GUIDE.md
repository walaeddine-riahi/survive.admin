# 🎯 Guide - Sidebar Sécurisée par Rôle

## Vue d'ensemble

La sidebar a été modifiée pour afficher uniquement les éléments accessibles en fonction du rôle de l'utilisateur :

- **ADMIN** : Accès à TOUTES les sections (Simulation, Instructeur, BIA, Workshop, Profil, Admin)
- **USER (Participant)** : Accès LIMITÉ à :
  - Mode Participant
  - Participations
  - Notifications
  - Profil
  - Paramètres

## 📝 Implémentation

### Fichier modifié: `src/components/layout/sidebar.tsx`

#### Changements clés:

1. **Import de useSession**

   ```typescript
   import { useSession } from "next-auth/react";
   ```

2. **Interfaces mises à jour**

   ```typescript
   interface RouteChild {
     title: string;
     href: string;
     rolesRequired?: string[]; // ✨ Nouveau
   }
   ```

3. **Logique de filtrage**

   ```typescript
   // Vérifie si l'utilisateur a les permissions
   const canAccessRoute = (rolesRequired?: string[]): boolean => {
     if (!rolesRequired || rolesRequired.length === 0) {
       return true;
     }
     return rolesRequired.includes(userRole);
   };

   // Filtre les routes selon le rôle
   const filteredRoutes = getFilteredRoutes();
   ```

4. **Rendu filtré**
   ```typescript
   {filteredRoutes.map((route) => (
     // Affiche seulement les routes accessibles
   ))}
   ```

## 🧪 Scénarios de Test

### Test 1: Login en tant qu'ADMIN

```
1. Aller à http://localhost:3000/connection
2. Entrer: admin@survive.tn / Admin@123456
3. Se connecter
```

**Attendu dans la sidebar:**

- ✅ Accueil
- ✅ Simulation (+ enfants)
- ✅ Instructeur (+ enfants)
- ✅ BIA (+ enfants)
- ✅ Workshop (+ enfants)
- ✅ Profil (+ enfants)
- ✅ Admin (+ enfants)

### Test2: Login en tant que PARTICIPANT

```
1. Aller à http://localhost:3000/connection
2. Entrer: participant@survive.tn / Participant@123456
3. Se connecter
```

**Attendu dans la sidebar:**

- ✅ Accueil (toujours visible, pas de restriction)
- ✅ Simulation → sous-menu = Mode Participant + Participations UNIQUEMENT
- ❌ Instructeur (section masquée)
- ❌ BIA (section masquée)
- ❌ Workshop (section masquée - sauf Notifications)
- ✅ Profil → sous-menu = Mon Profil + Paramètres UNIQUEMENT
- ❌ Admin (section masquée)

### Test 3: Vérifier le masquage des routes

```typescript
// Ouvrir DevTools > Application > Cookies
// L'utilisateur participant devrait voir:
{
  "email": "participant@survive.tn",
  "role": "USER",  // ← Cette valeur est utilisée pour filtrer
  "name": "Participant Test"
}
```

### Test 4: Tentative d'accès direct aux routes masquées

```
Participant essaie d'accéder à http://localhost:3000/admin
```

**Attendu**:

- Redirigé vers `/participant-mode` par le middleware
- Sidebar n'affiche pas le lien "/admin"

## 🔍 Points à vérifier

- [ ] La sidebar se met à jour après le login
- [ ] Les sections admin sont masquées pour les participants
- [ ] Les enfants filtrés correctement affichés
- [ ] Les sections vides supprimées (ex: si tous les enfants sont masqués)
- [ ] Les clics sur les liens fonctionnent normalement
- [ ] Le logout fonctionne
- [ ] La sidebar se compile sans erreurs

## 🛠️ Dépannage

### La sidebar affiche toujours tout (même restriction)

**Cause**: `useSession` ne renvoie pas la session

**Solution**:

1. Vérifier que `<SessionProvider>` enveloppe l'app dans `src/app/providers.tsx`
2. Vérifier que la session contient `role` dans `src/lib/auth.ts`
3. Redémarrer l'application

### Les sessions ne se chargent pas

**Cause**: NextAuth non configuré correctement

**Solution**:

```bash
# Vérifier la variable d'environnement
echo $NEXTAUTH_SECRET
# Doit être défini

# Rebuild si nécessaire
npm run build
npm run dev
```

### Section reste visible après filtrage

**Cause**: Les enfants restent mais la section ne devrait pas l'être

**Solution**:
Vérifier que le filtre inclut:

```typescript
.filter((route) => !route.children || route.children.length > 0)
```

## 📊 Tableau: Routes par Rôle

| Route       | Admin | USER      |
| ----------- | ----- | --------- |
| Accueil     | ✅    | ✅        |
| Simulation  | ✅    | Partiel\* |
| Instructeur | ✅    | ❌        |
| BIA         | ✅    | ❌        |
| Workshop    | ✅    | Partiel\* |
| Profil      | ✅    | ✅        |
| Admin       | ✅    | ❌        |

\*Partiel = Seulement certains enfants visibles

## 📚 Routes accessibles par rôle en détail

### ADMIN - Toutes les routes

```
Simulation:
  ✅ Liste des simulations
  ✅ Créer simulation
  ✅ Scénarios
  ✅ Injections
  ✅ Mode Participant
  ✅ Participations

Instructeur: (Tous)
BIA: (Tous)
Workshop: (Tous)
Admin: (Tous)
```

### USER - Routes réduites

```
Simulation:
  ✅ Mode Participant
  ✅ Participations

Workshop:
  ✅ Notifications

Profil:
  ✅ Mon Profil
  ✅ Paramètres
```

## 🚀 Prochaines étapes

1. Tester avec les deux rôles
2. Vérifier les transitions après login/logout
3. Envisager d'ajouter un indicateur visuel du rôle actuel
4. Logs pour tracer les accès filtrés

---

**Dernière mise à jour**: Avril 2026
