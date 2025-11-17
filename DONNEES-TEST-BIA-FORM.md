# 📋 Données de Test - Formulaire BIA Complet

## 🎯 Vue d'ensemble

Le formulaire BIA a été pré-rempli avec des **données de test réalistes** pour faciliter les tests et démonstrations.

**Scénario**: Processus de production pharmaceutique - Ligne A

---

## ✅ Sections Pré-remplies

### **Section 1: Informations Générales**

| Champ            | Valeur de test                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **Nom**          | Processus de Production - Ligne A                                                           |
| **Description**  | Processus critique de fabrication des produits pharmaceutiques sur la ligne de production A |
| **Département**  | Production                                                                                  |
| **Localisation** | Usine Principale - Bâtiment B                                                               |
| **Usine**        | (Première usine disponible)                                                                 |

---

### **Section 2: Responsable du Processus**

| Champ         | Valeur de test                |
| ------------- | ----------------------------- |
| **Nom**       | Ahmed Ben Salem               |
| **Fonction**  | Responsable Production        |
| **Email**     | ahmed.bensalem@entreprise.com |
| **Téléphone** | +216 71 234 567               |

---

### **Section 3: Criticité & Métriques BIA**

| Champ         | Valeur de test                                                     |
| ------------- | ------------------------------------------------------------------ |
| **Impact**    | Arrêt complet de la production, perte de revenus de 50 000 DT/jour |
| **Criticité** | 🔴 CRITICAL                                                        |
| **RTO**       | 4 heures                                                           |
| **MTPD**      | 8 heures                                                           |
| **RPO**       | 2 heures                                                           |
| **MBCO**      | 12 heures maximum avant impact client                              |

---

### **Section 2b: Impacts de la Perturbation**

#### 📅 **Périodes critiques**

```
- Fin de mois (clôture comptable)
- Haute saison (Juin-Septembre)
- Période de Ramadan
```

#### 💰 **Impacts financiers**

```
- Perte de chiffre d'affaires: 50 000 DT/jour
- Pénalités contractuelles: 10 000 DT/jour
- Coûts de récupération: 20 000 DT
```

#### ⚙️ **Impacts opérationnels**

```
- Arrêt de la ligne de production
- Retard des livraisons clients
- Surcharge des autres lignes de production
- Perte de productivité: 30%
```

#### 📢 **Impacts sur la réputation**

```
- Perte de confiance des clients
- Impact sur l'image de marque
- Risque de perte de parts de marché
- Mécontentement des partenaires
```

#### ⏱️ **Retards / Capacité opérationnelle**

```
- Réduction de capacité de 40%
- Retards de livraison: 5-7 jours
- Impossibilité de respecter les SLA
- Accumulation du backlog
```

---

### **Section 3: Périmètre et Dépendances**

#### 🎯 **Fonctionnalité principale**

```
Assurer la production continue des médicaments avec respect des normes GMP
et des délais de livraison aux distributeurs
```

#### 📦 **Dépendances Produits/Services**

```
Médicament A | Dépendance totale - production exclusive
Médicament B | Dépendance partielle - backup sur Ligne C
Médicament C | Dépendance critique - 80% de la production
```

#### 🔗 **Dépendances Interservices**

```
Maintenance | Support technique quotidien et préventif
Qualité | Contrôle qualité obligatoire à chaque batch
Logistique | Approvisionnement matières premières
IT | Système MES pour traçabilité
```

---

### **Section 4: Activités Critiques** (2 éléments)

#### Activité 1

- **Nom**: Préparation des matières premières
- **Criticité**: 🔴 Critique
- **Délai acceptable**: Immédiat
- **RTO**: 2h | **MTPD**: 4h | **RPO**: 1h
- **Impacts**: Blocage complet de la chaîne, Non-conformité GMP

#### Activité 2

- **Nom**: Contrôle qualité en cours de production
- **Criticité**: 🟠 Haute
- **Délai acceptable**: 4 heures
- **RTO**: 4h | **MTPD**: 8h | **RPO**: 2h
- **Impacts**: Arrêt ligne si défaut, Sanctions réglementaires

---

### **Section 5: Fournisseurs Externes** (2 éléments)

#### Fournisseur 1: PharmaChem SARL

- **Service**: Matières premières actives
- **Criticité**: 🔴 Critique
- **Contact**: Mohamed Trabelsi (+216 71 123 456)
- **Localisation**: Tunisie - Sousse
- **RTO**: 24h | **MTPD**: 48h
- **PCA**: ✅ Oui | **SLA**: ✅ Oui

#### Fournisseur 2: PackTech International

- **Service**: Emballages et étiquettes
- **Criticité**: 🟡 Moyenne
- **Contact**: Salah Ben Ali (+216 71 987 654)
- **Localisation**: Tunisie - Tunis
- **RTO**: 48h | **MTPD**: 96h
- **PCA**: ❌ Non | **SLA**: ✅ Oui

---

### **Section 5: Obligations Légales** (2 éléments)

#### Obligation 1: GMP (Bonnes Pratiques de Fabrication)

- **Référence**: Directive 2003/94/CE
- **Autorité**: Ministère de la Santé - Direction de la Pharmacie
- **Conséquences**: Suspension production, Amendes 50K-500K DT, Retrait produits

#### Obligation 2: ISO 9001:2015

- **Référence**: ISO 9001:2015
- **Autorité**: INNORPI
- **Conséquences**: Perte certification, Perte marchés publics

---

### **Section 6: Systèmes Informatiques** (2 éléments)

#### Système 1: SAP ERP Production

- **Type**: ERP
- **Criticité**: 🔴 Critique
- **RTO**: 4h | **RPO**: 1h | **MTPD**: 8h
- **Sauvegardes**: ✅ Oui
- **Solution secours**: Mode dégradé manuel avec formulaires papier
- **Incidents**: Panne serveur 15/03/2024 - 2h d'arrêt

#### Système 2: Siemens SCADA

- **Type**: SCADA/Supervision
- **Criticité**: 🟠 Haute
- **RTO**: 2h | **RPO**: 0.5h | **MTPD**: 4h
- **Sauvegardes**: ✅ Oui
- **Solution secours**: Supervision locale sur automates

---

### **Section 7: Infrastructures Physiques** (2 éléments)

#### Infrastructure 1: Alimentation électrique

- **Catégorie**: ⚡ Électricité
- **Criticité**: 🔴 Critique
- **RTO**: 0.5h | **MTPD**: 2h
- **Alternatives**: Groupe électrogène 500 kVA + UPS 100 kVA

#### Infrastructure 2: Climatisation salle blanche

- **Catégorie**: ❄️ Climatisation
- **Criticité**: 🟠 Haute
- **RTO**: 2h | **MTPD**: 4h
- **Alternatives**: Système redondant + Procédure arrêt si T>25°C

---

### **Section 8: Personnel et Rôles** (2 éléments)

#### Rôle 1: Opérateur de production ligne A

- **Nombre**: 8 personnes
- **Tâches**: Conduite ligne, Contrôles, Enregistrement données
- **Critique**: ✅ Oui
- **Remplacement**: Possible (Opérateurs lignes B et C)
- **Formation**: 2 semaines + 1 mois tutorat

#### Rôle 2: Technicien maintenance

- **Nombre**: 3 personnes
- **Tâches**: Maintenance préventive, Dépannage, Réglages
- **Critique**: ✅ Oui
- **Remplacement**: Possible (Équipe centrale)
- **Formation**: 3 mois

---

### **Section 9A: Équipements Industriels** (2 éléments)

#### Équipement 1: Mélangeur principal V-200

- **Modèle**: GERICKE GCM 200
- **Tâche**: Mélange matières premières poudre
- **Criticité**: 🔴 Critique
- **RTO**: 8h | **MTPD**: 24h
- **Puissance**: 15 kW (400V Triphasé)
- **Consommation**: 120 kWh/jour
- **Alternative**: Mélangeur ligne B (50% capacité)

#### Équipement 2: Presse rotative PR-45

- **Modèle**: FETTE 3090
- **Tâche**: Compression comprimés
- **Criticité**: 🔴 Critique
- **RTO**: 12h | **MTPD**: 48h
- **Puissance**: 22 kW (400V Triphasé)
- **Consommation**: 176 kWh/jour
- **Alternative**: Ligne C (30%) ou sous-traitance

---

### **Section 9B: Équipements Bureautiques** (2 éléments)

#### Équipement 1: PC de supervision

- **Quantité actuelle**: 4 unités
- **Quantité requise après incident**: 2 unités
- **Criticité**: 🟠 Haute
- **RTO**: 4h | **MTPD**: 8h
- **Fournisseur**: Dell Technologies
- **Solution**: PC portables de secours (3 unités)

#### Équipement 2: Imprimante étiquettes

- **Quantité actuelle**: 2 unités
- **Quantité requise après incident**: 1 unité
- **Criticité**: 🔴 Critique
- **RTO**: 2h | **MTPD**: 4h
- **Fournisseur**: Zebra Technologies
- **Solution**: Imprimante backup + étiquettes pré-imprimées

---

### **Section 10: Documentations Critiques** (2 éléments)

#### Document 1: Procédures de fabrication (Batch Records)

- **Format**: 📄 Papier + 💾 Numérique
- **Emplacement principal**: Serveur GED + Classeur salle production
- **Backup**: Cloud + Coffre-fort archives
- **Criticité**: 🔴 Critique
- **RTO**: 1h
- **Responsable**: Responsable Qualité

#### Document 2: Plans de maintenance préventive

- **Format**: 💾 Numérique
- **Emplacement principal**: Serveur GMAO
- **Backup**: NAS (quotidien)
- **Criticité**: 🟠 Haute
- **RTO**: 4h
- **Responsable**: Chef maintenance

---

## 🎯 Utilisation

### Pour Tester le Formulaire

1. **Ouvrir la page de création de processus BIA**

   - Aller sur `/bia/processes/new`

2. **Le formulaire se charge avec TOUTES les données**

   - 14 sections pré-remplies
   - 30+ champs scalaires avec valeurs
   - 16 lignes de tableaux multi-éléments (2 par section)

3. **Possibilités de test**:
   - ✅ Modifier n'importe quel champ
   - ✅ Ajouter des lignes supplémentaires dans les tableaux
   - ✅ Supprimer des lignes existantes
   - ✅ Enregistrer le formulaire complet
   - ✅ Vérifier la sauvegarde en base de données

### Pour Démarrer Vide

Si vous voulez un formulaire vide, il suffit de passer `initialData` avec des valeurs vides ou undefined.

---

## 📊 Statistiques des Données de Test

| Catégorie                     | Nombre d'éléments |
| ----------------------------- | ----------------- |
| **Champs scalaires remplis**  | 30+               |
| **Activités Critiques**       | 2                 |
| **Fournisseurs Externes**     | 2                 |
| **Obligations Légales**       | 2                 |
| **Systèmes Informatiques**    | 2                 |
| **Infrastructures Physiques** | 2                 |
| **Rôles Personnel**           | 2                 |
| **Équipements Industriels**   | 2                 |
| **Équipements Bureautiques**  | 2                 |
| **Documentations Critiques**  | 2                 |
| **TOTAL lignes tableaux**     | **16**            |

---

## ✅ Avantages

1. **Gain de temps** - Pas besoin de remplir manuellement pour tester
2. **Données réalistes** - Scénario pharmaceutique complet
3. **Test complet** - Toutes les sections avec données
4. **Démonstration** - Parfait pour présenter le système
5. **Formation** - Exemples concrets pour les utilisateurs

---

## 🔧 Personnalisation

Pour modifier les données de test, éditez le fichier:

```
src/components/bia/process-form-spreadsheet.tsx
```

Dans la section `defaultValues` du `useForm`.

---

## 🎉 Prêt à Tester!

Le formulaire est maintenant **pré-rempli avec des données réalistes** pour faciliter vos tests!

Accédez à `/bia/processes/new` pour voir le formulaire complet en action! 🚀

---

**Date de mise à jour**: ${new Date().toLocaleString('fr-FR')}  
**Fichier modifié**: `src/components/bia/process-form-spreadsheet.tsx`  
**Type de données**: Processus de production pharmaceutique
