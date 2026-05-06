# 🔐 Système d'Accès Basé sur les Rôles (RBAC)

Ce document explique comment les contrôles d'accès sont implémentés dans l'application Survive Admin.

## 📋 Vue d'ensemble

- **ADMIN** : Accès complet à l'administration, création de simulations, plans, incidents, usines, etc.
- **USER (Participant)**: Accès limité au mode participant uniquement - peut voir et participer aux simulations

## 🔑 Utilisateurs par défaut (Seed)

### Admin

- **Email** : admin@survive.tn
- **Mot de passe** : Admin@123456
- **Accès** : Toutes les routes, tableaux de bord d'administration, créations de ressources

### Participant

- **Email** : participant@survive.tn
- **Mot de passe** : Participant@123456
- **Accès** : Mode participant uniquement (`/participant-mode`, `/participant-view/${simulationId}`)

## 🚫 Routes Protégées (Admin uniquement)

### Pages Frontend

- `/admin` - Tableau de bord admin
- `/factories` - Gestion des usines
- `/plan` - Gestion des plans
- `/plan-type` - Types de plans
- `/risk` - Gestion des risques
- `/scenario` - Gestion des scénarios
- `/incident` - Gestion des incidents
- `/report` - Gestion des rapports
- `/bia` - Business Impact Analysis
- `/bia-form` - Formulaires BIA
- `/compliance` - Conformité
- `/conformity` - Conformité (alternatif)
- `/training` - Formation
- `/task` - Gestion des tâches
- `/injections` - Gestion des injections
- `/instructor-simulations` - Simulations instructeur

### Routes API (Protégées avec vérification ADMIN)

- `POST /api/simulations` - Créer une nouvelle simulation
- `POST /api/incidents` - Créer un nouvel incident
- `POST /api/plans` - Créer un nouveau plan

## ✅ Routes Accessibles aux Participants

- `/participant-mode` - Accueil du mode participant
- `/participant-view/[simulationId]` - Affichage d'une simulation
- `/simulation` - Liste des simulations assignées
- `/participations` - Participations aux simulations
- `/notifications` - Notifications
- `/profile` - Profil utilisateur
- `/settings` - Paramètres
- `/team-members` - Membres de l'équipe
- `/team-chat` - Chat d'équipe
- `/dashboard` - Tableau de bord basique

## 🛡️ Implémentation

### Middleware Frontend (src/middleware.ts)

Le middleware Next.js vérifie le rôle de l'utilisateur avant d'autoriser l'accès aux routes admin.  
Les utilisateurs non-admin sont automatiquement redirigés vers `/participant-mode`.

### Protection des Routes API (src/lib/role-protection.ts)

Fonctions utilitaires pour vérifier les rôles dans les routes API :

- `requireAuth()` - Vérifie l'authentification
- `requireAdmin()` - Vérifie que l'utilisateur est admin
- `errorResponse()` - Retourne une réponse d'erreur formatée

### Routes POST/PUT/DELETE

Toutes les opérations de création/modification nécessitent une authentification et une autorisation ADMIN.

## 🔄 Flux d'authentification

1. **Login** → Utilisateur se connecte sur `/connection`
2. **Vérification JWT** → Token NextAuth créé avec `role` inclus
3. **Middleware Check** → Vérifie le rôle avant d'accéder à la route
4. **Redirection** → Non-admin → `/participant-mode`
5. **API Check** → Routes API vérifient également le rôle en cas d'appel direct

## 📝 Notes importantes

- Les mots de passe des utilisateurs par défaut doivent être changés en production
- Les rôles sont stockés dans le JWT et vérifiés à chaque requête
- Le système est configurable via le fichier `middleware.ts`
- Les tests d'accès doivent inclure vérifications ADMIN et USER roles
