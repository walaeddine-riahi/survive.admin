# 🚀 Guide de Test Rapide - Fonctionnalité IA

## ⚡ Démarrage Rapide

### 1. Accéder à la page

```
http://localhost:3000/bia/processes/new
```

### 2. Créer un document de test

Créez un fichier Word (`test-process.docx`) avec ce contenu :

```
PROCESSUS BIA - TEST

Nom: Production Pharmaceutique Ligne A
Description: Processus critique de fabrication de médicaments
Département: Production
Localisation: Usine Principale Alger

RESPONSABLE
Nom: Ahmed Ben Salem
Rôle: Responsable Production
Email: ahmed.bensalem@pharma.dz
Téléphone: +213 21 234 567

CRITICITÉ
Niveau: CRITICAL
RTO: 4 heures
RPO: 2 heures
MTPD: 8 heures
MBCO: Production minimale de 50% pendant 12h maximum

IMPACTS EN CAS D'ARRÊT

Impact Financier (HIGH):
- Perte de revenus: 50 000 DT par jour
- Pénalités contractuelles: 10 000 DT par jour
- Coûts de récupération: 20 000 DT

Impact Opérationnel (CRITICAL):
- Arrêt complet de la ligne de production
- Retard des livraisons clients (5-7 jours)
- Surcharge des autres lignes

Impact Réputation (MEDIUM):
- Perte de confiance des clients
- Impact négatif sur l'image de marque

ACTIVITÉS CRITIQUES

1. Préparation des matières premières
   - Criticité: CRITICAL
   - RTO: 2 heures
   - RPO: 1 heure
   - Impact: Blocage complet de la chaîne de production

2. Contrôle qualité en cours de production
   - Criticité: HIGH
   - RTO: 4 heures
   - RPO: 2 heures
   - Impact: Risque de non-conformité des produits

3. Conditionnement et étiquetage
   - Criticité: HIGH
   - RTO: 6 heures
   - RPO: 2 heures
   - Impact: Impossibilité de livrer les produits finis

SYSTÈMES INFORMATIQUES

1. ERP SAP
   - Type: Enterprise Resource Planning
   - Criticité: CRITICAL
   - RTO: 4 heures
   - Alternative: Saisie manuelle temporaire

2. MES (Manufacturing Execution System)
   - Type: Système de gestion de production
   - Criticité: CRITICAL
   - RTO: 2 heures
   - Alternative: Papier + saisie différée

3. LIMS (Laboratory Information Management System)
   - Type: Gestion laboratoire qualité
   - Criticité: HIGH
   - RTO: 8 heures
   - Alternative: Registres papier

PERSONNEL REQUIS

1. Opérateurs de production
   - Nombre: 10 personnes
   - Compétences: Formation GMP obligatoire, habilitation machines
   - Criticité: CRITICAL
   - Backup: Pool de 5 opérateurs polyvalents

2. Contrôleurs qualité
   - Nombre: 3 personnes
   - Compétences: Formation analytique, certification QA
   - Criticité: CRITICAL
   - Backup: 2 contrôleurs seniors multi-sites

3. Techniciens de maintenance
   - Nombre: 2 personnes
   - Compétences: Électromécanique, automatisme
   - Criticité: HIGH
   - Backup: Contrat de maintenance externe

DÉPENDANCES

1. Service Maintenance
   - Type: Processus interne
   - Description: Support technique quotidien et préventif
   - Criticité: HIGH

2. Service Qualité
   - Type: Processus interne
   - Description: Contrôle qualité obligatoire à chaque batch
   - Criticité: CRITICAL

3. Service Logistique
   - Type: Processus interne
   - Description: Approvisionnement matières premières et livraison
   - Criticité: HIGH

4. Fournisseur PharmaChem
   - Type: Fournisseur externe
   - Description: Matières premières actives
   - Criticité: CRITICAL
```

### 3. Uploader et tester

1. **Glissez-déposez** le fichier `test-process.docx` dans la zone bleue

2. **Attendez l'analyse** (4-7 secondes)

   - "Upload en cours..."
   - "Analyse avec Azure OpenAI..."

3. **Vérifiez le résultat**

   - Message de succès : "✨ Formulaire rempli automatiquement !"
   - Toutes les sections du formulaire s'ouvrent
   - Les champs sont pré-remplis

4. **Parcourez les sections** :

   - ✅ Informations générales → Nom, description, département, localisation
   - ✅ Responsable → Nom, rôle, email, téléphone
   - ✅ Criticité → RTO, RPO, MTPD, MBCO
   - ✅ Impacts → Financier (HIGH), Opérationnel (CRITICAL), Réputation (MEDIUM)
   - ✅ Activités critiques → 3 activités avec RTO/RPO
   - ✅ Systèmes → ERP SAP, MES, LIMS
   - ✅ Personnel → Opérateurs, Contrôleurs, Techniciens
   - ✅ Dépendances → Services et fournisseurs

5. **Ajustez si nécessaire** (corrections manuelles)

6. **Enregistrez** le processus

## 🎯 Points de contrôle

### ✅ Checklist de validation

- [ ] La carte IA est visible en haut de page
- [ ] Le drag & drop fonctionne
- [ ] L'upload démarre au drop du fichier
- [ ] Les états visuels changent (uploading → analyzing → success)
- [ ] Le toast de confirmation s'affiche
- [ ] Toutes les sections du formulaire s'ouvrent
- [ ] Les champs sont correctement remplis
- [ ] Les valeurs numériques sont des nombres (RTO, RPO, MTPD)
- [ ] Les niveaux de criticité sont corrects (CRITICAL, HIGH, MEDIUM, LOW)
- [ ] Les tableaux sont remplis (impacts, activités, systèmes, personnel)
- [ ] Le bouton "Analyser un autre document" fonctionne

## 🐛 Problèmes courants

### Erreur: "Type de fichier non supporté"

**Solution**: Utilisez `.docx`, `.pdf`, `.xlsx`, `.xls` uniquement

### Erreur: "Fichier trop volumineux"

**Solution**: Réduisez la taille < 10 MB

### Erreur: "Pas assez de texte exploitable"

**Solution**: Ajoutez plus de contenu au document (minimum 50 caractères)

### Erreur HTTP 500

**Solution**:

1. Vérifiez que le serveur Next.js est démarré
2. Vérifiez les credentials Azure OpenAI dans `.env`
3. Consultez les logs console (F12)

### Pas de réponse après 30 secondes

**Solution**: Document trop complexe, essayez avec un document plus court

## 📊 Console de debug

Ouvrez la console (F12) pour voir :

```
📄 Extraction du texte depuis: test-process.docx
🤖 Analyse avec Azure OpenAI...
📋 Données IA reçues: { name: "Production...", ... }
✅ Données extraites avec succès
```

En cas d'erreur :

```
❌ Erreur lors de l'analyse: [détails]
```

## 🔄 Tester différents formats

### PDF

Exportez le Word en PDF et testez

### Excel

Créez un fichier `.xlsx` avec colonnes :

- Champ | Valeur
- Nom | Production Ligne A
- Département | Production
- etc.

## 🎓 Scénarios de test avancés

### Test 1: Document minimal

```
Nom: Test Process
Département: IT
Criticité: MEDIUM
```

**Attendu**: Remplissage partiel, autres champs vides

### Test 2: Document complet

Utilisez l'exemple ci-dessus
**Attendu**: Remplissage de toutes les sections

### Test 3: Document mal structuré

Texte sans structure claire
**Attendu**: Extraction partielle ou erreur "pas assez de texte"

### Test 4: Multiple uploads

1. Uploadez un premier document
2. Cliquez "Analyser un autre document"
3. Uploadez un second document
   **Attendu**: Formulaire mis à jour avec les nouvelles données

## ✨ Résultat attendu

Après un upload réussi, vous devriez voir :

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Analyse terminée !                                    │
│ Le formulaire a été rempli automatiquement.             │
│ Vérifiez et ajustez si nécessaire.                      │
│                                                          │
│ [📤 Analyser un autre document]                         │
└─────────────────────────────────────────────────────────┘
```

Et un toast :

```
🎉 ✨ Formulaire rempli automatiquement ! Vérifiez et ajustez les données si nécessaire.
```

## 📞 Support

Si ça ne fonctionne pas :

1. Vérifiez que le serveur est démarré (`pnpm dev`)
2. Vérifiez l'URL : `http://localhost:3000/bia/processes/new`
3. Ouvrez la console (F12) et cherchez des erreurs
4. Vérifiez `.env` pour les clés Azure OpenAI
5. Testez avec un document simple d'abord

---

**Temps de test estimé**: 5-10 minutes  
**Niveau**: Facile  
**Prérequis**: Serveur Next.js démarré, credentials Azure OpenAI configurés
