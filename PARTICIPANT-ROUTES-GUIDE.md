# ✅ Accès aux Routes pour les PARTICIPANTS

## Routes Frontend Accessibles

| Route                  | Status        | Notes                          |
| ---------------------- | ------------- | ------------------------------ |
| `/dashboard` (Accueil) | ✅ Accessible | Lien principal après connexion |
| `/participant-mode`    | ✅ Accessible | Mode participant               |
| `/participations`      | ✅ Accessible | Via Workshop → Événements      |
| `/notifications`       | ✅ Accessible | Via Workshop → Notifications   |
| `/profile`             | ✅ Accessible | Mon Profil                     |
| `/settings`            | ✅ Accessible | Paramètres                     |

## Sidebar - Éléments Visibles pour PARTICIPANT

```
✅ Accueil
├─ /dashboard

✅ Simulation (réduction)
└─ Mode Participant
└─ Participations

✅ Workshop (réduction)
├─ Événements → /participations
└─ Notifications → /notifications

✅ Profil
├─ Mon Profil
└─ Paramètres

❌ Instructeur (masqué)
❌ BIA (masqué)
❌ Admin (masqué)
```

## Routes Admin Uniquement

| Route        | Status       | Accessible      |
| ------------ | ------------ | --------------- |
| `/admin`     | 🔒 Restreint | ADMIN seulement |
| `/factories` | 🔒 Restreint | ADMIN seulement |
| `/plan`      | 🔒 Restreint | ADMIN seulement |
| `/scenario`  | 🔒 Restreint | ADMIN seulement |
| `/incident`  | 🔒 Restreint | ADMIN seulement |
| `/bia`       | 🔒 Restreint | ADMIN seulement |
| Et autres... | 🔒 Restreint | ADMIN seulement |

## Credentials de Test

```
📌 PARTICIPANT
Email: participant@survive.tn
Password: Participant@123456

Permissions: Mode Participant uniquement
Routes visible: Accueil, Participations, Notifications, Profil
```

```
👨‍💼 ADMIN
Email: admin@survive.tn
Password: Admin@123456

Permissions: Accès complet
Routes visibles: TOUTES
```

## Implémentation Technique

### Sidebar Filter (src/components/layout/sidebar.tsx)

```typescript
// Routes accessibles aux PARTICIPANT (USER)
const rules = [
  { route: "Accueil", roles: ["ADMIN", "USER"] },
  { route: "Mode Participant", roles: ["ADMIN", "USER"] },
  { route: "Participations", roles: ["ADMIN", "USER"] },
  { route: "Événements", roles: ["ADMIN", "USER"] },
  { route: "Notifications", roles: ["ADMIN", "USER"] },
  { route: "Profil", roles: ["ADMIN", "USER"] },
];
```

### Middleware Check (src/middleware.ts)

```typescript
const adminOnlyPaths = [
  "/admin",
  "/factories",
  "/plan",
  "/scenario",
  "/incident",
  "/bia",
  "/training",
  "/task",
];

// USER can access everything EXCEPT admin paths
```

### API Routes Protection

```typescript
// POST operations require ADMIN
if (session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
}

// GET operations accessible to everyone (authenticated)
```

## 🧪 Test Checklist

- [ ] Participant peut accéder à `/dashboard`
- [ ] Participant voit Option "Mode Participant" dans sidebar
- [ ] Participant peut accéder à `/participations`
- [ ] Participant voit "Événements" dans Workshop
- [ ] Participant peut accéder à `/notifications`
- [ ] Participant voit "Profil" avec ses enfants
- [ ] Participant NE voit PAS "Instructeur"
- [ ] Participant NE voit PAS "BIA"
- [ ] Participant NE voit PAS "Admin"
- [ ] Participant est redirigé de `/admin`
- [ ] Participant est redirigé de `/plan`
- [ ] Admin voit TOUTES les sections

## Troubleshooting

### Participant ne voit pas le mode participant

→ Vérifier que `rolesRequired: ["ADMIN", "USER"]` est bien set dans sidebar.tsx

### Participant acc ès denied à /participations

→ Vérifier le middleware.ts ne liste pas /participations dans adminOnlyPaths

### Session.user.role = undefined

→ Vérifier que NextAuth inclut `role` dans la session (src/lib/auth.ts callback)

---

**Mise à jour**: Avril 2026
**Version**: 2.0 (Avec support PARTICIPANT complet)
