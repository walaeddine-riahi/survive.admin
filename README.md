# S.U.R.V.I.V.E. Resilience - Plateforme de Continuité d'Activité et de Gestion de Crise

**S.U.R.V.I.V.E. Resilience** (Sustainability, Unity, Resilience, Vision, Innovation, Versatility, and Efficiency) est une application web complète conçue pour aider les organisations à renforcer leur résilience. Elle intègre des outils puissants pour l'analyse d'impact sur l'activité (BIA), la simulation de crise, et la gestion des équipes, le tout dans une interface moderne et intuitive.

> 💡 **Notre devise** : _"When the going gets tough, the tough get going"_ - Quand les temps deviennent difficiles, les forts se mettent en action.

## 🚀 Aperçu de la Plateforme

<table>
  <tr>
    <td align="center"><strong>Tableau de Bord Principal</strong></td>
    <td align="center"><strong>Analyse d'Impact (BIA) - Vue par Usine</strong></td>
  </tr>
  <tr>
    <td><img src="[Lien vers votre capture d'écran du tableau de bord]" alt="Tableau de Bord" width="400"/></td>
    <td><img src="[Lien vers votre capture d'écran de la liste BIA par usine]" alt="Analyse d'Impact par Usine" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Analyse Consolidée d'une Usine</strong></td>
    <td align="center"><strong>Module de Simulation de Crise</strong></td>
  </tr>
  <tr>
    <td><img src="[Lien vers votre capture d'écran de l'analyse consolidée]" alt="Analyse Consolidée" width="400"/></td>
    <td><img src="[Lien vers votre capture d'écran de la simulation de crise]" alt="Simulation de Crise" width="400"/></td>
  </tr>
    <tr>
    <td align="center"><strong>Gestion des Utilisateurs (Admin)</strong></td>
    <td align="center"><strong>Gestion des Équipes</strong></td>
  </tr>
  <tr>
    <td><img src="[Lien vers votre capture d'écran de la gestion des utilisateurs]" alt="Gestion des Utilisateurs" width="400"/></td>
    <td><img src="[Lien vers votre capture d'écran de la gestion des équipes]" alt="Gestion des Équipes" width="400"/></td>
  </tr>
</table>

## ✨ Fonctionnalités Principales

### 1. Module d'Analyse d'Impact sur l'Activité (BIA)

Ce module permet d'évaluer la criticité des processus métier et de comprendre les impacts d'une interruption.

- **Création de Rapports BIA** : Formulaires détaillés pour définir les processus, les impacts (financiers, réputationnels, etc.), le RTO et le RPO.
- **Double Moteur d'Analyse** :
  - **Analyse par IA (Google Gemini)** : Génère des recommandations et identifie les points de défaillance (SPOFs) grâce à une analyse intelligente.
  - **Analyse Heuristique** : Fournit une évaluation rapide basée sur des règles prédéfinies.
- **Analyse Consolidée par Usine** : Une fonctionnalité unique qui agrège les données de tous les rapports d'un site pour fournir une vue d'ensemble stratégique, identifier les risques systémiques et prioriser les actions à l'échelle de l'usine.

### 2. Module de Simulation de Crise

Entraînez vos équipes en conditions quasi réelles avec un environnement de simulation interactif.

- **Création de Scénarios** : Définissez des scénarios de crise, des objectifs et préparez le contenu de l'exercice.
- **Gestion des Tâches et Injections** : Assignez des tâches aux équipes et planifiez des injections d'événements (emails, appels, notifications) pour dynamiser la simulation.
- **Suivi en Temps Réel** : Les animateurs suivent la progression des tâches et déclenchent les événements, tandis que les participants collaborent sur leurs actions.

### 3. Gestion des Utilisateurs et des Équipes

Contrôlez les accès et organisez vos collaborateurs de manière efficace.

- **Gestion par Rôles** : Séparez les administrateurs (`ADMIN`) des utilisateurs standards (`USER`) pour sécuriser les fonctionnalités sensibles.
- **Création d'Équipes** : Regroupez les utilisateurs en équipes (ex: "Cellule de crise", "Équipe IT") pour faciliter l'assignation des responsabilités lors des simulations.
- **Authentification Flexible** : Prise en charge de l'inscription par email/mot de passe et de la connexion via Google.

## 🛠️ Pile Technologique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Base de données** : MongoDB avec Prisma ORM
- **Authentification** : NextAuth.js
- **UI** : Tailwind CSS, shadcn/ui, Radix UI
- **Analyse IA** : Google Gemini
- **Notifications SMS** : Twilio

## ⚙️ Installation et Lancement

Suivez ces étapes pour lancer le projet en local.

### Prérequis

- Node.js (v18+)
- pnpm
- Un compte MongoDB
- Des clés d'API pour Google et Twilio

### Étapes

1.  **Cloner le dépôt**

    ```bash
    git clone https://github.com/votre-utilisateur/battle-ground-main.git
    cd battle-ground-main
    ```

2.  **Installer les dépendances**

    ```bash
    pnpm install
    ```

3.  **Configurer les variables d'environnement**

    - Créez un fichier `.env` à la racine du projet.
    - Copiez le contenu de `.env.example` (si disponible) ou ajoutez les variables suivantes :

    ```env
    # Base de données
    DATABASE_URL="mongodb+srv://..."

    # Authentification
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="votre_secret_aleatoire"
    GOOGLE_CLIENT_ID="..."
    GOOGLE_CLIENT_SECRET="..."

    # APIs Externes
    GOOGLE_API_KEY="..."
    TWILIO_ACCOUNT_SID="..."
    TWILIO_AUTH_TOKEN="..."
    TWILIO_PHONE_NUMBER="..."
    ```

4.  **Synchroniser la base de données**

    ```bash
    pnpm prisma db push
    ```

5.  **Lancer le serveur de développement**
    ```bash
    pnpm dev
    ```

L'application est maintenant accessible à l'adresse `http://localhost:3000`.
