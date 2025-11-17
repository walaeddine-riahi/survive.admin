# Structure Visuelle du Dashboard BIA

## 🖥️ Layout Final

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TABLEAU DE BORD BIA                             │
│        Business Impact Analysis - Vue d'ensemble                    │
│                                                                     │
│                                         [Résilience: Excellent]     │
│                                         Score: 87/100               │
└─────────────────────────────────────────────────────────────────────┘

┌────────────┬────────────┬────────────┬────────────┐
│ Total      │ Critiques  │ RTO Moyen  │ MTPD Moyen │
│ Processus  │    🔴      │    ⏰      │    📈      │
│            │            │            │            │
│    42      │     8      │    48h     │    96h     │
│            │  + 15 Élevés│            │            │
└────────────┴────────────┴────────────┴────────────┘

┌────────────┬────────────┬────────────┐
│ RPO Moyen  │ Criticité  │ Conformité │
│    📊      │  🔴🟠🟡🟢  │  ISO 22301 │
│    12h     │  8 15 12 7 │    87%     │
└────────────┴────────────┴────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ [Vue d'ensemble] [Processus] [Analyses] [Rapports]                │
└────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════╗
║                       ONGLET: VUE D'ENSEMBLE                       ║
╚════════════════════════════════════════════════════════════════════╝

┌─────────────────────┬─────────────────────┬─────────────────────┐
│ ⚠️ 8 processus     │ ⏰ 12 processus    │ ✅ Bonne            │
│ critiques          │ avec RTO < 24h     │ répartition         │
└─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────┐
│ 🔴 Top 5 - Processus Critiques │ ⏰ Top 5 - RTO les plus Courts │
├─────────────────────────────────┼─────────────────────────────────┤
│ 1. Paie Mensuelle       [24h]  │ 1 │ Sauvegarde Data    [4h]    │
│ 2. Production Ligne A   [12h]  │ 2 │ Email Exchange     [8h]    │
│ 3. Service Clients      [48h]  │ 3 │ Portail Web        [12h]   │
│ 4. Facturation         [72h]  │ 4 │ Paie Mensuelle     [24h]   │
│ 5. Logistique          [96h]  │ 5 │ CRM                [36h]   │
└─────────────────────────────────┴─────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 🎯 Analyse par Département                                       │
├──────────────────────────────────────────────────────────────────┤
│ Ressources Humaines                    [12 processus]            │
│ ├─ 3 critiques  5 élevés                        RTO Moy: 48h    │
│ └─ ████████████░░░░░░░░░░░░░░ 60%                              │
│                                                                  │
│ Production                             [18 processus]            │
│ ├─ 5 critiques  8 élevés                        RTO Moy: 36h    │
│ └─ ██████████████░░░░░░░░░░░ 72%                               │
│                                                                  │
│ Finance                                [8 processus]             │
│ ├─ 0 critiques  2 élevés                        RTO Moy: 72h    │
│ └─ ████░░░░░░░░░░░░░░░░░░░░░ 25%                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 💡 Recommandations                                               │
├──────────────────────────────────────────────────────────────────┤
│ ✓ Prioriser les processus critiques                             │
│   Concentrez vos efforts sur les 8 processus critiques          │
│                                                                  │
│ ✓ Optimiser les RTO courts                                      │
│   12 processus nécessitent une reprise rapide (< 24h)           │
│                                                                  │
│ ✓ Tests réguliers                                               │
│   Planifiez des simulations de crise                            │
└──────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════╗
║                         ONGLET: PROCESSUS                          ║
╚════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────┐
│ Processus BIA                                  42 processus trouvés│
│                                                                    │
│ [🔄 Actualiser] [⬇️ Exporter] [➕ Nouveau processus]             │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ 🔍 [Rechercher...]  [🏭 Usine] [📊 Criticité] [🏢 Département]   │
│                                                 [📋 Liste] [🔲 Grille] │
└────────────────────────────────────────────────────────────────────┘

┌──────────┬────────────┬─────────┬──────────┬──────┬──────┬─────────┐
│ Processus│ Département│ Lieu    │ Criticité│ RTO  │ RPO  │ Actions │
├──────────┼────────────┼─────────┼──────────┼──────┼──────┼─────────┤
│ Paie     │ RH         │ Siège   │ 🔴 Crit. │ 24h  │ 4h   │ [📊][✏️]│
│ Mensuelle│            │         │          │      │      │         │
├──────────┼────────────┼─────────┼──────────┼──────┼──────┼─────────┤
│ Produc.  │ Production │ Usine A │ 🔴 Crit. │ 12h  │ 2h   │ [📊][✏️]│
│ Ligne A  │            │         │          │      │      │         │
├──────────┼────────────┼─────────┼──────────┼──────┼──────┼─────────┤
│ Service  │ Commercial │ Siège   │ 🟠 Élevé │ 48h  │ 8h   │ [📊][✏️]│
│ Clients  │            │         │          │      │      │         │
└──────────┴────────────┴─────────┴──────────┴──────┴──────┴─────────┘

╔════════════════════════════════════════════════════════════════════╗
║                        ONGLET: ANALYSES                            ║
╚════════════════════════════════════════════════════════════════════╝

┌─────────────────────┬─────────────────────┬─────────────────────┐
│  Distribution       │  Évolution RTO      │  Comparaison        │
│  par Criticité      │  dans le temps      │  Départements       │
│                     │                     │                     │
│   [Pie Chart]       │   [Line Chart]      │   [Bar Chart]       │
│                     │                     │                     │
│  🔴 19%             │     60h ────╲       │  RH      ████████   │
│  🟠 36%             │     48h      ╲___   │  Prod    ██████     │
│  🟡 29%             │     36h          ╲  │  Finance ███        │
│  🟢 16%             │     24h           ╲_│  IT      █████      │
└─────────────────────┴─────────────────────┴─────────────────────┘

╔════════════════════════════════════════════════════════════════════╗
║                        ONGLET: RAPPORTS                            ║
╚════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────┐
│ Rapports BIA Générés                           [➕ Nouveau Rapport]│
├────────────────────────────────────────────────────────────────────┤
│ 📄 Rapport BIA - Q4 2025               17/11/2025    [⬇️ PDF]     │
│ 📄 Analyse Criticité - RH              15/11/2025    [⬇️ Excel]   │
│ 📄 Synthèse Globale - Novembre         10/11/2025    [⬇️ PDF]     │
└────────────────────────────────────────────────────────────────────┘
```

## 🎨 Légende des Couleurs

```
🔴 Rouge   : Criticité critique / Alertes importantes
🟠 Orange  : Criticité élevée / Avertissements
🟡 Jaune   : Criticité moyenne / Attention
🟢 Vert    : Criticité faible / Succès
🔵 Bleu    : Informations / Liens
🟣 Violet  : Métriques avancées (MTPD)
```

## 📱 Responsive Mobile

```
┌───────────────────────┐
│   TABLEAU DE BORD     │
│         BIA           │
│  [Résilience: 87/100] │
├───────────────────────┤
│ Total Processus       │
│       42              │
├───────────────────────┤
│ Critiques             │
│       8               │
├───────────────────────┤
│ RTO Moyen             │
│       48h             │
├───────────────────────┤
│ [Vue] [Liste] [📊] [📄] │
├───────────────────────┤
│                       │
│  Contenu adaptatif    │
│  selon onglet         │
│                       │
└───────────────────────┘
```

## 🔄 États Interactifs

### Hover sur Carte KPI

```
┌────────────────┐
│ Total          │
│ Processus  🏢  │
│                │ → Animation shadow-md
│    42          │ → Échelle 1.02
└────────────────┘
```

### Sélection Onglet

```
[Vue d'ensemble]  → bg-white shadow-sm
[Processus]       → bg-transparent
[Analyses]        → bg-transparent
[Rapports]        → bg-transparent
```

### Filtres Actifs

```
🔍 [Rechercher: "paie"...]  ← Texte en bleu
[🏭 Usine A]                 ← Border bleu
[📊 Critique]                ← Background rouge léger
```

## ⚡ Animations

```typescript
// Rafraîchissement
[🔄 Actualiser] → onClick: spin animation 1s

// Chargement
[Skeleton]
┌─────────────────┐
│ ░░░░░░░░░░░░░░ │
│ ░░░░░░░░░      │
└─────────────────┘

// Barre progression département
██████░░░░░░░░░░  → Gradient animé left-to-right
```

## 🎯 Points Clés UX

1. **Hiérarchie Visuelle**

   - En-tête gradient capte l'attention
   - Cartes KPI en 4 colonnes (desktop)
   - Statistiques secondaires en 3 colonnes

2. **Navigation Intuitive**

   - Onglets toujours visibles
   - Icônes + texte pour clarté
   - Active state évident (fond blanc)

3. **Accessibilité**

   - Contraste élevé (criticité)
   - Tailles texte lisibles
   - Navigation clavier possible

4. **Performance**

   - Pas de rechargement entre onglets
   - Calculs côté client optimisés
   - Lazy loading des graphiques (futur)

5. **Feedback Utilisateur**
   - Alertes contextuelles
   - Recommandations actionnables
   - États de chargement visibles
