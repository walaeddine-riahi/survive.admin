# ✅ Checklist Rapide : Implémentation Factory-Process

## 📋 Préparation (30 minutes)

### Étape 1 : Sauvegardes

- [ ] Créer un backup MongoDB
  ```bash
  mongodump --uri="your_uri" --out=./backup-$(date +%Y%m%d)
  ```
- [ ] Créer une branche Git
  ```bash
  git checkout -b feature/factory-architecture
  git commit -am "Before factory implementation"
  ```
- [ ] Vérifier l'environnement
  ```bash
  npx prisma --version
  npm run build  # Vérifier que le projet compile
  ```

### Étape 2 : Lecture Documentation

- [ ] Lire `BIA-FACTORY-README.md` (10 min)
- [ ] Lire `BIA-FACTORY-ANALYSIS-SUMMARY.md` (15 min)
- [ ] Parcourir `BIA-FACTORY-ARCHITECTURE-DIAGRAM.md` (5 min)

---

## 🗄️ Modification du Schéma Prisma (1-2 heures)

### Étape 3 : Ajouter le Modèle Factory

- [ ] Ouvrir `prisma/schema.prisma`
- [ ] Copier le modèle Factory depuis `SCHEMA-FACTORY-PROPOSAL.prisma`
- [ ] Ajouter à la fin du fichier, avant les enums

### Étape 4 : Modifier le Modèle Process

- [ ] Localiser `model Process` dans `schema.prisma`
- [ ] Ajouter les champs :
  ```prisma
  factoryId    String?   @db.ObjectId
  factory      Factory?  @relation("FactoryProcesses", fields: [factoryId], references: [id], onDelete: SetNull)
  ```
- [ ] Ajouter l'index :
  ```prisma
  @@index([factoryId])
  ```

### Étape 5 : Modifier le Modèle BiaReport

- [ ] Localiser `model BiaReport` dans `schema.prisma`
- [ ] Ajouter les champs :
  ```prisma
  factoryId    String?   @db.ObjectId
  factory      Factory?  @relation("FactoryReports", fields: [factoryId], references: [id], onDelete: SetNull)
  ```
- [ ] Ajouter l'index :
  ```prisma
  @@index([factoryId])
  ```

### Étape 6 : Modifier le Modèle User

- [ ] Localiser `model User` dans `schema.prisma`
- [ ] Ajouter les relations :
  ```prisma
  createdFactories Factory[] @relation("CreatedFactories")
  managedFactories Factory[] @relation("ManagedFactories")
  ```

### Étape 7 : Générer la Migration

- [ ] Exécuter :
  ```bash
  npx prisma migrate dev --name add_factory_model
  ```
- [ ] Vérifier que la migration a été créée
- [ ] Vérifier qu'il n'y a pas d'erreurs

---

## 🔄 Migration des Données (2 heures)

### Étape 8 : Préparer la Migration

- [ ] Copier le script de migration :
  ```bash
  # Vérifier que scripts/migrate-categories-to-factories.ts existe
  ls -la scripts/migrate-categories-to-factories.ts
  ```
- [ ] Lire le script pour comprendre la logique
- [ ] Identifier le nombre de catégories existantes

### Étape 9 : Test de Migration (Environnement Local)

- [ ] Exécuter le script :
  ```bash
  npx tsx scripts/migrate-categories-to-factories.ts
  ```
- [ ] Vérifier les logs :
  - Nombre de catégories trouvées
  - Nombre de Factories créées
  - Nombre de Reports mis à jour
  - Nombre de Process mis à jour
  - Erreurs éventuelles

### Étape 10 : Vérification Post-Migration

- [ ] Exécuter le script de vérification :
  ```bash
  npx tsx scripts/verify-factory-migration.ts
  ```
- [ ] Vérifier dans Prisma Studio :
  ```bash
  npx prisma studio
  ```
  - [ ] Ouvrir la table `factories`
  - [ ] Vérifier les données créées
  - [ ] Ouvrir la table `processes`
  - [ ] Vérifier que `factoryId` est renseigné
  - [ ] Ouvrir la table `bia_reports`
  - [ ] Vérifier que `factoryId` est renseigné

---

## 🎨 Développement Frontend (1-2 jours)

### Étape 11 : APIs Backend

#### API Liste des Factories

- [ ] Créer `src/app/api/factories/route.ts`
- [ ] Implémenter GET (liste toutes les factories)
- [ ] Implémenter POST (créer une factory)
- [ ] Tester avec Postman/cURL

#### API Factory Individuelle

- [ ] Créer `src/app/api/factories/[id]/route.ts`
- [ ] Implémenter GET (détails d'une factory)
- [ ] Implémenter PATCH (mettre à jour)
- [ ] Implémenter DELETE (supprimer)
- [ ] Tester avec Postman/cURL

#### API Analyse Factory

- [ ] Créer `src/app/api/factories/[id]/analyze/route.ts`
- [ ] Implémenter POST (générer analyse consolidée)
- [ ] Tester avec Postman/cURL

### Étape 12 : Pages Frontend

#### Page Liste des Factories

- [ ] Copier l'exemple :
  ```bash
  cp src/app/\(app\)/bia/factories/page-example.tsx \
     src/app/\(app\)/bia/factories/page.tsx
  ```
- [ ] Adapter si nécessaire
- [ ] Tester la page :
  ```bash
  npm run dev
  # Naviguer vers http://localhost:3000/bia/factories
  ```

#### Composant Client Factories

- [ ] Copier l'exemple :
  ```bash
  cp src/components/bia/factories-client-example.tsx \
     src/components/bia/factories-client.tsx
  ```
- [ ] Adapter si nécessaire
- [ ] Corriger les erreurs TypeScript/ESLint

#### Page d'Analyse Factory

- [ ] Modifier `src/app/(app)/bia/factories/[category]/analysis/page.tsx`
- [ ] Renommer le dossier : `[category]` → `[factoryId]`
- [ ] Adapter le code pour utiliser `factoryId` au lieu de `category`
- [ ] Tester la page d'analyse

### Étape 13 : Mise à Jour des Formulaires

#### Formulaire Process

- [ ] Localiser le formulaire de création/édition de Process
- [ ] Remplacer le champ `location` (texte libre) par un sélecteur Factory
- [ ] Implémenter le composant `FactorySelector`
- [ ] Tester la création d'un Process avec Factory
- [ ] Tester la modification d'un Process existant

#### Formulaire BiaReport

- [ ] Localiser le formulaire de création/édition de Rapport
- [ ] Remplacer le champ `category` par un sélecteur Factory
- [ ] Tester la création d'un Rapport avec Factory
- [ ] Tester la modification d'un Rapport existant

---

## 🧪 Tests (1 jour)

### Étape 14 : Tests Fonctionnels

#### Tests CRUD Factory

- [ ] Créer une Factory via l'interface
  - Remplir tous les champs requis
  - Vérifier la création dans Prisma Studio
- [ ] Modifier une Factory
  - Changer le nom
  - Changer la ville
  - Vérifier la mise à jour
- [ ] Lister les Factories
  - Vérifier l'affichage
  - Tester les filtres (actif/inactif)
  - Tester la recherche
- [ ] Supprimer une Factory vide
  - Créer une Factory sans processus/rapports
  - Supprimer et vérifier

#### Tests Relations

- [ ] Créer un Process lié à une Factory
  - Vérifier la relation dans Prisma Studio
  - Vérifier l'affichage dans l'interface
- [ ] Créer un Rapport lié à une Factory
  - Vérifier la relation
  - Vérifier l'affichage
- [ ] Modifier un Process pour changer sa Factory
  - Vérifier la mise à jour
- [ ] Tenter de supprimer une Factory avec des Process
  - Vérifier que c'est bloqué ou en cascade selon config

#### Tests Analyse Consolidée

- [ ] Accéder à l'analyse d'une Factory
  - Vérifier les métriques (RTO, criticité, etc.)
  - Vérifier les rapports listés
  - Vérifier les processus listés
  - Vérifier les recommandations
- [ ] Comparer avec l'ancien système (category)
  - Vérifier que les données sont équivalentes

### Étape 15 : Tests de Performance

- [ ] Mesurer le temps de chargement de la liste des Factories
- [ ] Mesurer le temps de génération d'une analyse consolidée
- [ ] Comparer avec l'ancien système
- [ ] Vérifier les requêtes SQL/MongoDB dans les logs

### Étape 16 : Tests de Non-Régression

- [ ] Vérifier que les autres modules fonctionnent toujours
  - Liste des Process
  - Création de Process
  - Liste des Rapports
  - Création de Rapports
- [ ] Vérifier que les données existantes sont intactes

---

## 🚀 Déploiement (1 jour)

### Étape 17 : Préparation Staging

#### Backup Production

- [ ] Créer un snapshot de la base de données production
- [ ] Documenter la procédure de rollback
- [ ] Tester le restore du backup sur un environnement de test

#### Déploiement Staging

- [ ] Déployer le code sur staging
  ```bash
  git push staging feature/factory-architecture
  ```
- [ ] Exécuter la migration Prisma sur staging
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Exécuter le script de migration des données sur staging
  ```bash
  npx tsx scripts/migrate-categories-to-factories.ts
  ```
- [ ] Vérifier les données sur staging
  ```bash
  npx tsx scripts/verify-factory-migration.ts
  ```

### Étape 18 : Tests Staging

- [ ] Tests fonctionnels complets
- [ ] Tests de performance
- [ ] Tests avec utilisateurs réels (UAT)
- [ ] Vérifier les logs d'erreurs
- [ ] Collecter les retours utilisateurs

### Étape 19 : Déploiement Production

#### Go/No-Go Meeting

- [ ] Revue des tests staging
- [ ] Validation des parties prenantes
- [ ] Confirmation du planning

#### Déploiement

- [ ] Planifier une fenêtre de maintenance (si nécessaire)
- [ ] Informer les utilisateurs
- [ ] Déployer le code en production
  ```bash
  git checkout main
  git merge feature/factory-architecture
  git push origin main
  ```
- [ ] Exécuter la migration Prisma
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Exécuter le script de migration des données
  ```bash
  npx tsx scripts/migrate-categories-to-factories.ts
  ```
- [ ] Vérifier les données
  ```bash
  npx tsx scripts/verify-factory-migration.ts
  ```

#### Post-Déploiement

- [ ] Monitoring :
  - Vérifier les logs d'application
  - Vérifier les logs de base de données
  - Surveiller les erreurs
  - Surveiller les performances
- [ ] Tests smoke en production
  - Créer une Factory de test
  - Créer un Process de test
  - Vérifier l'analyse consolidée
  - Supprimer les données de test

### Étape 20 : Formation et Documentation

- [ ] Former les utilisateurs :
  - Gestion des Factories
  - Association Process-Factory
  - Analyse consolidée
- [ ] Mettre à jour la documentation utilisateur
- [ ] Envoyer un email de communication
- [ ] Organiser une session Q&A

---

## 📊 Suivi Post-Déploiement (Semaine 1)

### Monitoring

- [ ] Jour 1 : Surveillance intensive
  - Vérifier toutes les heures
  - Répondre rapidement aux questions
- [ ] Jour 2-3 : Surveillance régulière
  - Vérifier 2-3 fois par jour
  - Collecter les retours
- [ ] Jour 4-7 : Surveillance normale
  - Vérifier quotidiennement
  - Analyser les métriques

### Métriques à Suivre

- [ ] Nombre de Factories créées
- [ ] Taux d'association Process-Factory
- [ ] Taux d'utilisation de l'analyse consolidée
- [ ] Temps de réponse des APIs
- [ ] Erreurs éventuelles
- [ ] Satisfaction utilisateurs

### Optimisations

- [ ] Identifier les points de friction
- [ ] Optimiser les requêtes lentes
- [ ] Améliorer l'UX si nécessaire
- [ ] Ajouter des fonctionnalités demandées

---

## ✅ Critères de Succès

### Techniques

- [ ] 0 erreurs en production
- [ ] 100% des données migrées
- [ ] Temps de réponse < 2s pour les analyses
- [ ] 0 régression sur les fonctionnalités existantes

### Fonctionnels

- [ ] Les utilisateurs peuvent créer des Factories
- [ ] Les utilisateurs peuvent associer Process à Factory
- [ ] Les analyses consolidées sont précises
- [ ] L'interface est intuitive

### Business

- [ ] Gain de temps dans la gestion BIA
- [ ] Meilleure visibilité par usine
- [ ] Données plus fiables
- [ ] Satisfaction utilisateurs > 80%

---

## 📞 Contacts en Cas de Problème

### Rollback

Si un problème critique survient :

1. [ ] Arrêter le déploiement
2. [ ] Revenir à la version précédente du code
3. [ ] Restaurer le backup de la base de données
4. [ ] Analyser le problème
5. [ ] Corriger et re-planifier

### Support

- **Documentation** : Voir les fichiers `BIA-FACTORY-*.md`
- **Code** : Voir les exemples dans `src/` et `scripts/`
- **Logs** : Vérifier les logs d'application et de base de données

---

**Date de création** : ${new Date().toLocaleDateString('fr-FR')}
**Dernière mise à jour** : ${new Date().toLocaleDateString('fr-FR')}
**Version** : 1.0.0
