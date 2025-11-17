# Mise à jour des mots de passe Ooredoo ✅

## Résumé

Tous les comptes utilisateurs avec un email **@ooredoo.tn** ont été mis à jour avec un mot de passe unifié.

---

## Script créé

**Fichier** : `scripts/update-ooredoo-passwords.ts`

### Fonctionnalité

Met à jour le mot de passe de tous les utilisateurs ayant un email se terminant par `@ooredoo.tn`.

### Processus

1. **Recherche** : Trouve tous les utilisateurs avec `email LIKE '%@ooredoo.tn'`
2. **Hachage** : Crée un hash bcrypt du nouveau mot de passe avec salt factor 10
3. **Mise à jour** : Met à jour le champ `password` pour chaque utilisateur
4. **Rapport** : Affiche un résumé détaillé avec compteurs de succès/erreurs

---

## Nouveau mot de passe

```
Mot de passe : ooredoo
```

**Tous les utilisateurs Ooredoo** peuvent maintenant se connecter avec :

- **Email** : [leur email @ooredoo.tn]
- **Mot de passe** : `ooredoo`

---

## Exécution

### Commande

```bash
npx tsx scripts/update-ooredoo-passwords.ts
```

### Résultat de l'exécution

✅ **Script exécuté avec succès**

- ❌ Erreurs : 0
- 📧 Nouveau mot de passe : "ooredoo"
- Tous les comptes Ooredoo mis à jour

---

## Sécurité

### Hachage bcrypt

Le mot de passe est stocké de manière sécurisée :

```typescript
const hashedPassword = await bcrypt.hash("ooredoo", 10);
```

- **Algorithme** : bcrypt
- **Salt rounds** : 10
- **Stockage** : Hash uniquement (mot de passe en clair jamais stocké)

### Scope de la mise à jour

Le script cible **uniquement** les emails se terminant par `@ooredoo.tn` :

```typescript
where: {
  email: {
    endsWith: "@ooredoo.tn",
  },
}
```

Les comptes avec d'autres domaines (gmail.com, etc.) ne sont **pas affectés**.

---

## Code source

### Structure du script

```typescript
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const NEW_PASSWORD = "ooredoo";

async function updateOoredooPasswords() {
  // 1. Trouver tous les utilisateurs @ooredoo.tn
  const ooredooUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@ooredoo.tn" } },
  });

  // 2. Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

  // 3. Mettre à jour chaque utilisateur
  for (const user of ooredooUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }
}
```

### Gestion des erreurs

- ✅ Try/catch pour chaque mise à jour individuelle
- ✅ Compteurs de succès et d'erreurs
- ✅ Logs détaillés pour chaque utilisateur
- ✅ Déconnexion Prisma en finally

---

## Utilisation future

### Réexécuter le script

Si besoin de réinitialiser les mots de passe Ooredoo :

```bash
npx tsx scripts/update-ooredoo-passwords.ts
```

### Modifier le mot de passe

Pour changer le mot de passe par défaut, éditer la ligne 8 :

```typescript
const NEW_PASSWORD = "votre_nouveau_mot_de_passe";
```

### Étendre à d'autres domaines

Pour inclure d'autres domaines d'email :

```typescript
where: {
  OR: [
    { email: { endsWith: "@ooredoo.tn" } },
    { email: { endsWith: "@autre-domaine.com" } },
  ];
}
```

---

## Comptes concernés

Tous les utilisateurs de la simulation Ooredoo avec emails :

- `slim.kefi@ooredoo.tn`
- `sinda.melaouah@ooredoo.tn`
- `zied.menchari@ooredoo.tn`
- `hichem.mrabet@ooredoo.tn`
- `nadia.taga@ooredoo.tn`
- `selima.ounissi@ooredoo.tn`
- `wael.jeridi@ooredoo.tn`
- `imen.bahri@ooredoo.tn`
- `olfa.draoua@ooredoo.tn`
- `kaouther.manai@ooredoo.tn`
- `nabil.bouzouita@ooredoo.tn`
- `emna.kchok@ooredoo.tn`
- `mohamed.rifi@ooredoo.tn`
- `houda.tlili@ooredoo.tn`
- Et tous les autres comptes @ooredoo.tn dans la base de données

---

## Instructions de connexion pour les utilisateurs

**Pour tous les participants Ooredoo** :

1. Aller sur la page de connexion
2. Entrer votre email professionnel : `[prenom].[nom]@ooredoo.tn`
3. Entrer le mot de passe : `ooredoo`
4. Cliquer sur "Se connecter"

**Note** : Si vous avez des difficultés à vous connecter, vérifiez que vous utilisez bien votre email professionnel Ooredoo (@ooredoo.tn).

---

Date de mise à jour : 22 octobre 2025  
Statut : ✅ Complété avec succès
