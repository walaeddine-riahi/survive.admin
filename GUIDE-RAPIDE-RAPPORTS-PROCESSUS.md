# Guide Rapide : Générer un Rapport BIA depuis un Processus

## 🎯 Objectif

Créer automatiquement un rapport BIA complet à partir d'un processus existant en quelques clics.

## 📍 Accès

1. Naviguer vers **BIA** → **Rapports**
2. Cliquer sur l'onglet **"Générer depuis Processus"**

## 📋 Étapes

### 1️⃣ Rechercher un processus

**Filtres disponibles** :

- **Usine** : Sélectionner une usine spécifique ou "Toutes les usines"
- **Recherche** : Taper un mot-clé (nom, département, description)

**Résultat** : Le compteur affiche le nombre de processus trouvés

### 2️⃣ Sélectionner un processus

Cliquer sur le processus dans la liste.

**Informations affichées** :

- 📌 Nom du processus
- 📝 Description
- 🏢 Département
- 🏭 Usine
- 🔴 Criticité (badge coloré)
- ⏱️ RTO (Recovery Time Objective)

**Indicateur** : Une coche verte ✓ apparaît sur le processus sélectionné.

### 3️⃣ Configurer le rapport

La section "Générer le rapport" apparaît automatiquement.

**Champs** :

- **Nom du rapport** : Généré automatiquement, modifiable
  - Format par défaut : `Rapport BIA - {Nom du processus}`
- **Description** : Générée automatiquement, modifiable
  - Format par défaut : `Rapport d'analyse d'impact métier pour le processus {Nom} ({Département})`

**Contenu inclus** :

- ✅ Analyse d'impact métier
- ✅ Criticité et métriques (RTO, MTPD, RPO)
- ✅ Dépendances et ressources
- ✅ Recommandations de continuité

### 4️⃣ Générer le rapport

Cliquer sur le bouton **"Générer le rapport"**

**Traitement** :

- Analyse automatique des 9 catégories de ressources
- Calcul du niveau de continuité
- Génération de recommandations intelligentes
- Création du rapport

**Redirection** : Vous serez automatiquement redirigé vers le rapport généré.

## 🎨 Interface

### Liste des processus

```
┌─────────────────────────────────────────────────────┐
│ Processus de Production - Ligne A          [CRITIQUE]│
│ Processus critique de fabrication...                │
│ Production • 🏭 Usine Principale                     │
│                                      ⏱️ RTO: 4h   ✓│
└─────────────────────────────────────────────────────┘
```

### Badge de criticité

- 🔴 **Critique** : Rouge
- 🟠 **Élevée** : Orange
- 🟡 **Moyenne** : Jaune
- 🟢 **Faible** : Vert

## 📊 Contenu du Rapport Généré

### Sections principales

1. **Informations générales**

   - Nom, département, localisation
   - Responsable du processus
   - Usine associée

2. **Métriques BIA**

   - RTO (Recovery Time Objective)
   - MTPD (Maximum Tolerable Period of Disruption)
   - RPO (Recovery Point Objective)
   - MBCO (Minimum Business Continuity Objective)
   - **Niveau de continuité** (0-100%)

3. **Analyse des impacts**

   - Impact financier
   - Impact opérationnel
   - Impact sur la réputation
   - Impact sur la capacité opérationnelle

4. **Périmètre et dépendances**

   - Fonctionnalité principale
   - Dépendances produits
   - Dépendances inter-services

5. **Ressources critiques** (9 catégories)

   - Activités critiques
   - Fournisseurs externes
   - Obligations légales
   - Systèmes informatiques
   - Infrastructures physiques
   - Rôles et personnel
   - Équipements industriels
   - Équipements bureautiques
   - Documentation critique

6. **Analyse des risques**

   - Nombre de risques identifiés
   - Nombre d'activités critiques
   - Nombre de fournisseurs critiques
   - Nombre de systèmes critiques

7. **Recommandations**
   - Recommandations de **priorité HAUTE**
   - Recommandations de **priorité MOYENNE**
   - Recommandations de **priorité FAIBLE**

## 💡 Exemples de Recommandations

### Priorité HAUTE 🔴

**Systèmes de sauvegarde manquants**

> "Pour un processus de criticité élevée, il est essentiel de disposer de systèmes de sauvegarde redondants."

**Fournisseurs sans BCP**

> "2 fournisseur(s) n'ont pas de plan de continuité d'activité documenté : PharmaChem SARL, PackTech International"

**Systèmes sans sauvegardes**

> "1 système(s) n'ont pas de sauvegardes en place : LIMS - Laboratoire"

### Priorité MOYENNE 🟡

**Travail à distance**

> "Explorer les options de travail à distance pour assurer la continuité en cas d'indisponibilité du site."

**Infrastructure alternative**

> "Documenter et tester des infrastructures alternatives pour assurer la continuité."

## ⚡ Astuces

### Recherche rapide

Utilisez des mots-clés courts :

- "prod" → trouve "Production"
- "ligne" → trouve "Ligne A", "Ligne B", etc.
- "critique" → trouve tous les processus critiques

### Filtre par usine

Sélectionnez une usine spécifique si vous gérez plusieurs sites.

### Nom du rapport

Personnalisez le nom pour une meilleure organisation :

- "Rapport Q4 2025 - Production Ligne A"
- "Audit BIA - Processus Logistique"

## 🚀 Après la génération

### Actions disponibles

1. **Consulter le rapport**

   - Voir toutes les sections détaillées
   - Analyser les recommandations

2. **Partager le rapport**

   - Générer un lien de partage
   - Définir une date d'expiration

3. **Exporter le rapport**

   - PDF (à venir)
   - DOCX (à venir)

4. **Archiver le rapport**
   - Changer le statut en "ARCHIVED"

## ❓ FAQ

### Puis-je générer plusieurs rapports pour le même processus ?

✅ Oui ! Vous pouvez générer autant de rapports que nécessaire (ex: rapport mensuel, rapport d'audit, etc.).

### Le rapport est-il mis à jour si je modifie le processus ?

❌ Non. Le rapport est une capture à un instant T. Vous devez générer un nouveau rapport pour avoir les données actualisées.

### Puis-je modifier le rapport après génération ?

⚠️ Pas directement. Le rapport est généré automatiquement. Pour des modifications, générez un nouveau rapport ou exportez et éditez manuellement.

### Les recommandations sont-elles personnalisables ?

📊 Les recommandations sont générées automatiquement selon des règles prédéfinies basées sur les meilleures pratiques BIA.

## 🔗 Liens utiles

- [Documentation complète](./RAPPORTS-BIA-DEPUIS-PROCESSUS.md)
- [Liste des processus](http://localhost:3000/bia/processes)
- [Créer un nouveau processus](http://localhost:3000/bia/processes/new)
- [Tableau de bord BIA](http://localhost:3000/bia/dashboard)

---

**💡 Conseil** : Générez vos rapports BIA régulièrement (mensuel/trimestriel) pour suivre l'évolution de vos processus critiques !
