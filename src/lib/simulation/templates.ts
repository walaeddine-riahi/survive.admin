// ─── Types ────────────────────────────────────────────────────────────────────

export type SimChannel = "EMAIL" | "SMS" | "CALL" | "ALERT" | "FLASH_INFO" | "WHATSAPP" | "INTERNAL_RADIO";
export type InjectPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export type InjectPhase = "detection" | "containment" | "escalation" | "recovery" | "comms" | "legal" | "debrief";
export type SimType = "tabletop" | "partial" | "full_dr" | "cyber";
export type SimDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface InjectDef {
  order: number;
  offsetMin: number;         // T+ minutes from simulation start
  channel: SimChannel;
  priority: InjectPriority;
  senderPersona: string;
  subject?: string;
  body: string;
  expectedActions: string[];
  phase: InjectPhase;
  targetRoles?: string[];    // empty = all participants
  expiresInMin?: number;
}

export interface RoleDef {
  role: string;
  team?: string;
  description: string;
  isRequired: boolean;
}

export interface EvalCriteriaDef {
  name: string;
  weight: number;
  category: string;
  description: string;
}

export interface SimTemplate {
  id: string;
  title: string;
  description: string;
  scenario: string;
  duration_min: number;
  difficulty: SimDifficulty;
  sector?: string;
  objectives: string[];
  briefingText: string;
  scenarioContext: string;
  injectSequence: InjectDef[];
  roles: RoleDef[];
  evaluationConfig: EvalCriteriaDef[];
  tags: string[];
  icon: string;
  color: string;
  bg: string;
}

// ─── Built-in templates ───────────────────────────────────────────────────────

export const BUILTIN_TEMPLATES: SimTemplate[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. RANSOMWARE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-ransomware",
    title: "Attaque Ransomware",
    description: "Chiffrement progressif des systèmes d'information — détection, confinement, communication de crise et reprise d'activité.",
    scenario: "RANSOMWARE",
    duration_min: 90,
    difficulty: "HARD",
    objectives: [
      "Tester la procédure de détection et d'escalade",
      "Vérifier la réactivité de la cellule de crise IT",
      "Évaluer la communication interne et externe sous pression",
      "Tester la procédure de restauration depuis les sauvegardes",
    ],
    briefingText: `Bienvenue dans cet exercice de simulation de gestion de crise. 
    
Vous allez être confrontés à une situation de crise cybersécurité. Votre mission est de gérer la situation en respectant les procédures de votre plan de gestion de crise.

Quelques règles :
• Toutes les communications passent par la plateforme de simulation
• Vous recevrez des messages, appels et alertes en temps réel
• Documentez vos décisions et actions
• L'exercice dure 90 minutes

Bonne chance à tous.`,
    scenarioContext: `Il est 09h47 un lundi matin. Plusieurs utilisateurs du siège signalent que leurs fichiers sont inaccessibles et que des messages en anglais apparaissent sur leurs écrans demandant un paiement en Bitcoin. Le service informatique reçoit simultanément des alertes de l'EDR concernant un chiffrement massif en cours sur les serveurs de fichiers.

L'attaque semble avoir démarré dans la nuit et se propage rapidement. Les premières investigations suggèrent un vecteur d'entrée par phishing ciblé reçu la semaine dernière par un collaborateur du service Finance.`,
    injectSequence: [
      {
        order: 1, offsetMin: 2, channel: "ALERT", priority: "CRITICAL",
        senderPersona: "Système de Monitoring IT",
        body: "🚨 ALERTE CRITIQUE — Chiffrement massif détecté sur SRV-FILES-01, SRV-FILES-02 et SRV-ERP-PROD. 847 fichiers chiffrés/minute. Extension .locked détectée. EDR a isolé automatiquement 3 postes. Action immédiate requise.",
        expectedActions: ["Notifier le RSSI et la direction", "Activer la cellule de crise", "Isoler les systèmes affectés"],
        phase: "detection", targetRoles: [], expiresInMin: 10,
      },
      {
        order: 2, offsetMin: 5, channel: "SMS", priority: "HIGH",
        senderPersona: "Direction Informatique",
        body: "RSSI — urgence absolue. Nos serveurs ERP et fichiers sont chiffrés. Je ne peux plus accéder aux systèmes de production. Le système de backup automatique s'est peut-être aussi lancé sur des données chiffrées. Besoin de toi immédiatement.",
        expectedActions: ["Suspendre les sauvegardes automatiques", "Évaluer l'étendue de la compromission"],
        phase: "detection", targetRoles: ["RSSI", "DSI"],
      },
      {
        order: 3, offsetMin: 10, channel: "EMAIL", priority: "HIGH",
        senderPersona: "Direction Générale",
        subject: "Situation critique — point de situation demandé",
        body: `Équipe,

Je viens d'être informé d'une situation critique sur nos systèmes informatiques. 

J'ai besoin d'un point de situation précis dans les 15 minutes :
1. Quels systèmes sont affectés ?
2. L'activité de production est-elle impactée ?
3. Nos données clients sont-elles compromises ?
4. Quel est le plan d'action immédiat ?

Le Comité de Direction se réunit dans 30 minutes. Préparez un point exécutif.

Direction Générale`,
        expectedActions: ["Préparer un point de situation", "Identifier les systèmes critiques affectés", "Évaluer l'impact métier"],
        phase: "escalation", targetRoles: ["Responsable BCM", "RSSI", "DSI"],
      },
      {
        order: 4, offsetMin: 15, channel: "CALL", priority: "HIGH",
        senderPersona: "CERT-FR / ANSSI",
        body: "Bonjour, je suis du CERT-FR. Nous avons détecté une attaque active ciblant plusieurs organisations de votre secteur ce matin. Le malware identifié est LockBit 3.0. Nous avons des IOC à vous transmettre. Êtes-vous en mesure de traiter l'information maintenant ? Avez-vous déjà notifié votre assureur cyber ?",
        expectedActions: ["Recueillir les IOC", "Contacter l'assureur cyber", "Documenter la notification CERT"],
        phase: "escalation", targetRoles: ["RSSI"],
      },
      {
        order: 5, offsetMin: 20, channel: "WHATSAPP", priority: "NORMAL",
        senderPersona: "Responsable Supply Chain",
        body: "Les fournisseurs demandent si nos portails EDI sont opérationnels. J'ai 3 commandes urgentes bloquées. Notre accès à SAP est complètement perdu. Que leur dis-je ? On a des pénalités contractuelles si on dépasse 24h.",
        expectedActions: ["Prioriser la reprise des systèmes critiques", "Communiquer aux fournisseurs", "Activer les procédures dégradées"],
        phase: "escalation", targetRoles: ["Responsable BCM", "Supply Chain"],
      },
      {
        order: 6, offsetMin: 25, channel: "EMAIL", priority: "CRITICAL",
        senderPersona: "Inconnu — contact.recover@protonmail.com",
        subject: "Your files have been encrypted — READ NOW",
        body: `YOUR NETWORK HAS BEEN COMPROMISED

All your files have been encrypted with military-grade encryption.

To recover your files: Pay 2.3 BTC (≈ 89,000€) within 72 hours.
Contact: recover2024@protonmail.com
Your ID: LC-2024-FR-087

WARNING: Do not contact law enforcement. Do not attempt to restore from backup. Do not shut down servers.

After 72 hours, price doubles. After 5 days, files are permanently deleted.`,
        expectedActions: ["NE PAS payer la rançon", "Conserver la preuve", "Déposer plainte", "Contacter l'assureur"],
        phase: "escalation", expiresInMin: 60,
      },
      {
        order: 7, offsetMin: 30, channel: "SMS", priority: "HIGH",
        senderPersona: "Responsable RH",
        body: "Des employés paniquent et commencent à publier des posts sur LinkedIn et Twitter sur l'attaque. Certains mentionnent des données RH compromises. La DRH demande une communication interne urgente. Que faire ?",
        expectedActions: ["Préparer une communication interne", "Demander discrétion sur les réseaux sociaux", "Évaluer si données RH sont compromises"],
        phase: "comms", targetRoles: ["Communication", "RH"],
      },
      {
        order: 8, offsetMin: 40, channel: "ALERT", priority: "HIGH",
        senderPersona: "Équipe IT",
        body: "MISE À JOUR : Backup offline confirmé intact (dernière sauvegarde : hier 23h00). Serveurs ERP chiffrés à 80%. Serveurs de messagerie épargnés. Datacenter secondaire non affecté. RTO estimé pour restauration ERP : 6-8h. Action décision requise : lancer la restauration maintenant ?",
        expectedActions: ["Décision de restauration", "Activer le DRP", "Coordonner avec les métiers pour priorisation"],
        phase: "recovery", targetRoles: ["RSSI", "DSI", "Responsable BCM"],
      },
      {
        order: 9, offsetMin: 50, channel: "CALL", priority: "HIGH",
        senderPersona: "Journaliste — Journal du Net",
        body: "Bonjour, je couvre l'actualité cybersécurité. Nous avons eu une information selon laquelle votre société aurait subi une attaque ransomware ce matin. Des sources indiquent que des données clients seraient compromises. Souhaitez-vous faire une déclaration ? Nous publions dans 2 heures.",
        expectedActions: ["Préparer un communiqué de presse minimal", "Valider avec Direction et Juridique", "NE PAS confirmer détails techniques"],
        phase: "comms", targetRoles: ["Communication", "Direction"],
      },
      {
        order: 10, offsetMin: 60, channel: "EMAIL", priority: "NORMAL",
        senderPersona: "Assureur Cyber — AXA Cyber",
        subject: "Ouverture de dossier sinistre — réf. CY-2024-1847",
        body: `Madame, Monsieur,

Suite à votre déclaration de sinistre cyber, nous confirmons l'ouverture du dossier CY-2024-1847.

Un expert de crise est disponible dans l'heure. Veuillez nous transmettre :
1. Rapport d'incident initial (nature, étendue, systèmes affectés)
2. Logs de détection
3. Preuve de sauvegarde offline intacte
4. Actions de confinement entreprises

Votre couverture inclut : assistance technique 24/7, frais de notification CNIL, perte d'exploitation jusqu'à 15 jours.

Cordialement,
AXA Cyber Claims`,
        expectedActions: ["Préparer le rapport d'incident", "Envoyer les documents requis", "Coordonner avec l'expert désigné"],
        phase: "legal", targetRoles: ["Responsable BCM", "Juridique"],
      },
      {
        order: 11, offsetMin: 75, channel: "FLASH_INFO", priority: "NORMAL",
        senderPersona: "Coordinateur de crise",
        body: "FLASH — T+75min : Restauration ERP lancée sur datacenter secondaire (ETA : 3h). Messagerie opérationnelle. Portail fournisseurs en mode dégradé. Communication interne envoyée. Notification CNIL initiée (délai 72h). Prochaine réunion cellule de crise : T+90min.",
        expectedActions: ["Confirmer les actions en cours", "Documenter la timeline", "Préparer le debrief"],
        phase: "recovery",
      },
    ],
    roles: [
      { role: "RSSI", team: "Cellule cyber", description: "Responsable Sécurité des SI — pilote la réponse technique", isRequired: true },
      { role: "DSI", team: "Cellule cyber", description: "Directeur des Systèmes d'Information", isRequired: true },
      { role: "Responsable BCM", team: "Cellule de crise", description: "Pilote le plan de continuité d'activité", isRequired: true },
      { role: "Direction Générale", team: "Cellule de crise", description: "Décision stratégique et communication externe", isRequired: true },
      { role: "Responsable Communication", team: "Cellule de crise", description: "Communication interne et relations médias", isRequired: false },
      { role: "Responsable Juridique", team: "Cellule de crise", description: "Obligations légales, RGPD, dépôt de plainte", isRequired: false },
      { role: "Responsable RH", team: "Support", description: "Gestion des équipes et communication RH", isRequired: false },
    ],
    evaluationConfig: [
      { name: "Réactivité", weight: 20, category: "timing", description: "Délai de détection, d'escalade et d'activation" },
      { name: "Conformité plan", weight: 25, category: "conformity", description: "Respect des procédures du plan de crise" },
      { name: "Qualité décisionnelle", weight: 25, category: "decision", description: "Pertinence et rapidité des décisions" },
      { name: "Communication", weight: 15, category: "communication", description: "Clarté et ciblage des communications" },
      { name: "Gestion du stress", weight: 15, category: "tonality", description: "Maîtrise émotionnelle sous pression" },
    ],
    tags: ["cyber", "ransomware", "IT", "RGPD", "communication de crise"],
    icon: "Lock",
    color: "#A32D2D",
    bg: "#FCEBEB",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. DATACENTER OUTAGE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-datacenter",
    title: "Panne Datacenter",
    description: "Indisponibilité majeure du datacenter principal — activation du site de reprise et reprise d'activité progressive.",
    scenario: "DATACENTER_OUTAGE",
    duration_min: 120,
    difficulty: "MEDIUM",
    objectives: [
      "Activer et tester le Plan de Reprise Informatique (PRI)",
      "Vérifier les délais de basculement sur le site de secours",
      "Tester la communication avec les parties prenantes internes",
      "Valider l'ordre de priorité de reprise des applications",
    ],
    briefingText: "Vous participez à un exercice de reprise d'activité sur sinistre informatique majeur. L'objectif est de tester votre Plan de Reprise Informatique et de valider votre capacité à basculer sur le site de secours dans les délais définis par la BIA.",
    scenarioContext: "Un incendie déclaré dans la salle électrique du datacenter principal en dehors des heures ouvrables a provoqué l'arrêt d'urgence de l'ensemble des équipements. Le datacenter est inaccessible jusqu'à intervention des pompiers et expertise technique. RTO défini par la BIA : 4h pour les applications critiques.",
    injectSequence: [
      {
        order: 1, offsetMin: 0, channel: "ALERT", priority: "CRITICAL",
        senderPersona: "Système d'Astreinte",
        body: "🚨 ALERTE MAJEURE — Datacenter principal HORS SERVICE. Arrêt d'urgence déclenché à 02h47. Cause : incendie salle électrique. Pompiers sur place. Aucune victime. TOUS les services hébergés sont DOWN. RTO cible : 4h. Plan de Reprise Informatique à activer IMMÉDIATEMENT.",
        expectedActions: ["Activer le PRI", "Constituer la cellule de crise IT", "Notifier les parties prenantes"],
        phase: "detection", expiresInMin: 15,
      },
      {
        order: 2, offsetMin: 5, channel: "SMS", priority: "HIGH",
        senderPersona: "Responsable Datacenter",
        body: "Je suis sur place. Les pompiers ne permettent pas l'accès avant 3h minimum. Dommages limités à la salle élec, serveurs physiquement intacts mais alimentation coupée. Site de secours opérationnel confirmé. On peut lancer le basculement.",
        expectedActions: ["Lancer le basculement vers le site de secours", "Prioriser les applications critiques"],
        phase: "detection", targetRoles: ["DSI", "Responsable IT"],
      },
      {
        order: 3, offsetMin: 15, channel: "EMAIL", priority: "HIGH",
        senderPersona: "Direction Générale",
        subject: "Situation panne IT — impact activité",
        body: "Quelle est la durée estimée d'indisponibilité ? L'équipe commerciale a des rendez-vous clients importants ce matin avec accès CRM requis. La direction financière doit clôturer les écritures comptables du mois avant 10h. Quelles sont nos priorités de reprise ?",
        expectedActions: ["Communiquer le plan de reprise priorisé", "Indiquer les RTO applicatifs", "Activer les procédures dégradées"],
        phase: "escalation", targetRoles: ["DSI", "Responsable BCM"],
      },
      {
        order: 4, offsetMin: 30, channel: "CALL", priority: "HIGH",
        senderPersona: "Hébergeur Cloud — Support P1",
        body: "Bonjour, suite à votre ticket P1, nos équipes confirment que votre environnement de secours est prêt à basculer. Nous avons besoin de votre validation formelle pour lancer la procédure de failover. Temps estimé de basculement : 45 minutes. Vous avez un numéro d'autorisation ?",
        expectedActions: ["Valider le basculement", "Obtenir l'autorisation de la direction", "Documenter la décision"],
        phase: "recovery", targetRoles: ["DSI", "Responsable IT"],
      },
      {
        order: 5, offsetMin: 45, channel: "SMS", priority: "NORMAL",
        senderPersona: "Équipe Technique IT",
        body: "Basculement ERP et messagerie terminé. Accès rétabli. Par contre le CRM et le portail RH ne répondent pas encore — problème de configuration réseau sur le site de secours. ETA fix : 30 min. Les données sont intactes, RPO = 0 (réplication synchrone).",
        expectedActions: ["Communiquer le rétablissement partiel", "Gérer le problème CRM/RH", "Informer les utilisateurs"],
        phase: "recovery",
      },
      {
        order: 6, offsetMin: 60, channel: "EMAIL", priority: "NORMAL",
        senderPersona: "Responsable Comptabilité",
        body: "ERP accessible mais les états de clôture du mois sont en erreur. Il manque les transactions de la nuit. Le système de réplication s'est arrêté à 01h23 alors que des traitements batch tournaient. Y a-t-il un risque sur l'intégrité des données ? On ne peut pas clôturer sans vérification.",
        expectedActions: ["Vérifier l'intégrité des données", "Lancer une procédure de vérification", "Communiquer sur le délai de clôture"],
        phase: "recovery", targetRoles: ["DSI", "Responsable IT"],
      },
      {
        order: 7, offsetMin: 90, channel: "FLASH_INFO", priority: "NORMAL",
        senderPersona: "Coordinateur PRI",
        body: "BILAN T+90min — ERP ✅ Messagerie ✅ CRM ✅ RH en cours (ETA 15min). Intégrité données confirmée. Datacenter principal accessible dans 2-3h. Décision : maintien sur site secours jusqu'à validation complète du retour. Prochain point à T+120.",
        expectedActions: ["Valider le plan de retour", "Préparer la communication fin de crise", "Documenter les écarts RTO"],
        phase: "recovery",
      },
    ],
    roles: [
      { role: "DSI", team: "Cellule IT", description: "Directeur des Systèmes d'Information — pilote le PRI", isRequired: true },
      { role: "Responsable IT", team: "Cellule IT", description: "Coordinateur technique de la reprise", isRequired: true },
      { role: "Responsable BCM", team: "Cellule de crise", description: "Coordination globale et communication direction", isRequired: true },
      { role: "Direction Générale", team: "Décision", description: "Arbitrages stratégiques et communication", isRequired: false },
    ],
    evaluationConfig: [
      { name: "Réactivité", weight: 25, category: "timing", description: "Délai d'activation du PRI" },
      { name: "Conformité PRI", weight: 30, category: "conformity", description: "Respect des procédures du Plan de Reprise" },
      { name: "Qualité technique", weight: 25, category: "decision", description: "Pertinence des décisions techniques" },
      { name: "Communication", weight: 20, category: "communication", description: "Information des parties prenantes" },
    ],
    tags: ["IT", "datacenter", "PRI", "reprise", "continuité"],
    icon: "Server",
    color: "#534AB7",
    bg: "#EEEDFE",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. COMMUNICATION CRISIS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-comms",
    title: "Crise de Communication",
    description: "Buzz médiatique négatif et gestion de la réputation — communication de crise, réseaux sociaux, relations médias.",
    scenario: "COMMUNICATION_CRISIS",
    duration_min: 60,
    difficulty: "MEDIUM",
    objectives: [
      "Tester la procédure de gestion de crise médiatique",
      "Évaluer la coordination entre Direction, Communication et Juridique",
      "Tester la réactivité sur les réseaux sociaux",
      "Vérifier la chaîne de validation des prises de parole externes",
    ],
    briefingText: "Vous allez gérer une crise de réputation qui se développe rapidement sur les réseaux sociaux et dans les médias. La rapidité et la cohérence de vos communications seront déterminantes.",
    scenarioContext: "Un post viral sur LinkedIn d'un ex-employé allègue des pratiques managériales abusives et des conditions de travail dégradées. La publication accumule 2 400 partages en 3 heures. Plusieurs journalistes ont contacté le standard. Des hashtags négatifs sur l'entreprise commencent à tendancer sur Twitter.",
    injectSequence: [
      {
        order: 1, offsetMin: 0, channel: "ALERT", priority: "HIGH",
        senderPersona: "Veille Médias",
        body: "🔴 ALERTE RÉPUTATION — Post LinkedIn viral d'un ex-collaborateur (2400 partages). Accusations : harcèlement management, heures supplémentaires non payées, licenciement abusif. 3 journalistes ont contacté le standard. Hashtag #BoycottEntreprise commence à apparaître. Action immédiate requise.",
        expectedActions: ["Activer la cellule de crise communication", "Analyser le contenu viral", "Préparer les éléments de réponse"],
        phase: "detection",
      },
      {
        order: 2, offsetMin: 5, channel: "EMAIL", priority: "HIGH",
        senderPersona: "Responsable RH",
        subject: "Situation ex-collaborateur — éléments de contexte",
        body: "Je connais la situation. L'ex-collaborateur a été licencié pour insuffisance professionnelle il y a 3 mois. Il conteste la rupture aux prud'hommes. Son post contient des inexactitudes factuelles mais aussi des éléments réels sur une situation d'équipe difficile l'an dernier. Nous avons un conseil juridique en cours. Je vous transmets le dossier.",
        expectedActions: ["Analyser les risques juridiques", "Aligner les messages avec la réalité", "Coordonner avec le juridique"],
        phase: "detection", targetRoles: ["Communication", "Juridique", "RH"],
      },
      {
        order: 3, offsetMin: 10, channel: "CALL", priority: "HIGH",
        senderPersona: "Journaliste — Le Monde",
        body: "Bonjour, je prépare un article sur les conditions de travail dans votre secteur. J'ai vu le post LinkedIn et j'aimerais avoir la position officielle de votre entreprise. Avez-vous un communiqué ? Y a-t-il eu effectivement des problèmes managériaux ? Je publie dans 4 heures.",
        expectedActions: ["Préparer une position officielle", "Valider avec Direction et Juridique", "Décider de répondre ou non"],
        phase: "comms", targetRoles: ["Communication", "Direction"],
      },
      {
        order: 4, offsetMin: 15, channel: "SMS", priority: "HIGH",
        senderPersona: "Directeur Général",
        body: "Je vois des messages de clients sur nos réseaux. Certains disent qu'ils reconsidèrent leur relation commerciale. L'actionnaire principal m'a appelé. Il faut une réponse publique rapide mais il faut éviter d'aggraver les choses. Quel est votre plan ? Réunion dans 15 min.",
        expectedActions: ["Préparer une réponse publique équilibrée", "Aligner avec la direction", "Anticiper les questions shareholders"],
        phase: "escalation", targetRoles: ["Communication", "Direction"],
      },
      {
        order: 5, offsetMin: 25, channel: "WHATSAPP", priority: "NORMAL",
        senderPersona: "Community Manager",
        body: "Des centaines de commentaires arrivent sur notre page LinkedIn et Instagram. Certains sont de salariés actuels qui prennent position pour l'entreprise — ça aide mais certains disent des choses maladroites. D'autres ex-employés commencent à témoigner aussi. Je dois répondre aux commentaires ? On supprime les témoignages négatifs ?",
        expectedActions: ["Définir la politique de modération", "Guider le community manager", "Ne pas supprimer les témoignages légitimes"],
        phase: "comms", targetRoles: ["Communication"],
      },
      {
        order: 6, offsetMin: 35, channel: "EMAIL", priority: "HIGH",
        senderPersona: "Conseiller Juridique",
        subject: "Point juridique — action recommandée",
        body: "Après analyse du post : 2 éléments sont factuellement inexacts et potentiellement diffamatoires. En revanche, les autres points sont protégés par la liberté d'expression. Je recommande : (1) Ne pas commenter les aspects RH en cours de procédure, (2) Corriger factuellement les inexactitudes, (3) Envisager une mise en demeure uniquement sur les éléments diffamatoires clairement identifiés. NE PAS lancer de procédure précipitée — effet amplificateur garanti.",
        expectedActions: ["Intégrer les contraintes juridiques", "Adapter la communication externe", "Éviter l'escalade judiciaire"],
        phase: "legal", targetRoles: ["Direction", "Communication", "Juridique"],
      },
      {
        order: 7, offsetMin: 50, channel: "FLASH_INFO", priority: "NORMAL",
        senderPersona: "Veille Médias",
        body: "ÉVOLUTION — Suite à votre communiqué, le post original est moins partagé. Cependant un article du Monde vient de paraître (neutre). BFM Business demande un plateau TV demain matin. Sentiment global : 40% négatif / 35% neutre / 25% positif. La situation se stabilise.",
        expectedActions: ["Décider sur l'interview TV", "Planifier la communication interne aux équipes", "Préparer le suivi post-crise"],
        phase: "recovery",
      },
    ],
    roles: [
      { role: "Directeur Communication", team: "Cellule com.", description: "Pilote la stratégie de communication de crise", isRequired: true },
      { role: "Direction Générale", team: "Décision", description: "Porte-parole officiel et décideur final", isRequired: true },
      { role: "Responsable RH", team: "Support", description: "Éléments de contexte RH et droit du travail", isRequired: true },
      { role: "Conseiller Juridique", team: "Support", description: "Conseil sur les risques juridiques", isRequired: false },
    ],
    evaluationConfig: [
      { name: "Réactivité médias", weight: 20, category: "timing", description: "Délai de première réponse publique" },
      { name: "Cohérence messages", weight: 30, category: "decision", description: "Alignement et cohérence des prises de parole" },
      { name: "Gestion des parties prenantes", weight: 25, category: "communication", description: "Direction, médias, réseaux sociaux, salariés" },
      { name: "Maîtrise émotionnelle", weight: 25, category: "tonality", description: "Neutralité et professionnalisme sous pression" },
    ],
    tags: ["communication", "médias", "réseaux sociaux", "réputation", "crise RH"],
    icon: "MessageSquare",
    color: "#185FA5",
    bg: "#E6F1FB",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. DATA BREACH
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-breach",
    title: "Fuite de données RGPD",
    description: "Violation de données personnelles — détection, évaluation, notification CNIL dans les 72h et communication aux personnes concernées.",
    scenario: "CYBER_DATA_BREACH",
    duration_min: 75,
    difficulty: "HARD",
    objectives: [
      "Tester la procédure de gestion de violation de données RGPD",
      "Respecter le délai de notification CNIL de 72h (Art. 33)",
      "Évaluer la coordination DPO / RSSI / Juridique",
      "Tester la communication aux personnes concernées (Art. 34)",
    ],
    briefingText: "Cet exercice simule une violation de données personnelles au sens du RGPD. Votre objectif est de gérer l'incident tout en respectant les obligations réglementaires, notamment la notification à la CNIL dans les 72 heures.",
    scenarioContext: "L'équipe sécurité a détecté une activité suspecte sur la base de données clients. Les logs montrent des exports massifs de données la nuit dernière. Une première analyse suggère l'extraction de 47 000 dossiers clients incluant noms, emails, téléphones et historiques d'achat. Certains dossiers contiennent des données de santé (clients du programme bien-être).",
    injectSequence: [
      {
        order: 1, offsetMin: 0, channel: "ALERT", priority: "CRITICAL",
        senderPersona: "SIEM / Équipe SOC",
        body: "🚨 DÉTECTION — Export anormal base clients : 47 832 enregistrements exportés vers IP externe (185.192.xx.xx / Pays-Bas) entre 02h15 et 03h47. Credentials d'un administrateur utilisés. Compte actif. Données incluses : PII clients + données santé potentielles. VIOLATION DE DONNÉES PERSONNELLES PROBABLE — Protocole RGPD à activer.",
        expectedActions: ["Qualifier la violation RGPD", "Notifier le DPO immédiatement", "Révoquer les credentials compromis"],
        phase: "detection",
      },
      {
        order: 2, offsetMin: 5, channel: "SMS", priority: "HIGH",
        senderPersona: "DPO (Délégué à la Protection des Données)",
        body: "Je viens d'être notifié. Qualification RGPD : violation avérée. Art. 33 : délai 72h pour notification CNIL part MAINTENANT (T0 = heure de détection). Il faut : 1) évaluer la nature et le volume exact des données 2) évaluer le risque pour les personnes 3) décider si notification Art. 34 aux personnes concernées est nécessaire. Je prends la coordination.",
        expectedActions: ["Démarrer le registre des violations", "Évaluer l'impact sur les personnes", "Préparer la notification CNIL"],
        phase: "detection", targetRoles: ["DPO", "RSSI", "Juridique"],
      },
      {
        order: 3, offsetMin: 15, channel: "EMAIL", priority: "HIGH",
        senderPersona: "Responsable IT Sécurité",
        subject: "Analyse forensique — premiers résultats",
        body: `Analyse des logs en cours :
        
- Volume exact : 47 832 enregistrements (confirmé)
- Types de données : Nom, prénom, email, téléphone, adresse, historique achats
- Données sensibles : 1 243 enregistrements contiennent des données de santé (programme bien-être)
- Credentials compromis : compte admin "svc_backup" — mots de passe identiques depuis 2019
- Vecteur probable : credential stuffing sur le VPN (pas de MFA)
- Données exportées vers : serveur FTP externe anonymisé

L'attaquant a eu accès pendant environ 2h. Pas d'autres exports détectés.`,
        expectedActions: ["Quantifier précisément l'impact", "Identifier les personnes concernées", "Évaluer le risque résiduel"],
        phase: "containment", targetRoles: ["DPO", "RSSI", "Direction"],
      },
      {
        order: 4, offsetMin: 25, channel: "CALL", priority: "HIGH",
        senderPersona: "Avocat — Cabinet Spécialisé RGPD",
        body: "Bonjour. Suite à votre appel, voici mon analyse : violation Art. 4(12) RGPD confirmée. Obligation de notification CNIL Art. 33 : OUI, dans les 72h. Notification aux personnes Art. 34 : probablement requise pour les 1 243 personnes avec données de santé (risque élevé). Pour les 46 589 autres : à évaluer selon votre analyse de risque. Je peux vous aider à rédiger la notification CNIL. Avez-vous votre numéro SIREN et le nom de votre DPO désigné ?",
        expectedActions: ["Préparer la notification CNIL", "Rédiger la communication aux personnes concernées", "Documenter l'analyse de risque"],
        phase: "legal", targetRoles: ["DPO", "Juridique"],
      },
      {
        order: 5, offsetMin: 35, channel: "EMAIL", priority: "HIGH",
        senderPersona: "Directeur Commercial",
        subject: "Impact commercial — clients stratégiques",
        body: "J'ai appris la situation. Parmi les 47 000 clients touchés, nous avons 23 comptes Grands Comptes avec des contrats en cours. Certains ont des clauses contractuelles sur la sécurité des données. Est-ce qu'on doit les prévenir individuellement avant la notification officielle ? Certains risquent de nous quitter si ça sort dans les médias avant notre communication.",
        expectedActions: ["Définir la stratégie de notification clients stratégiques", "Aligner communication commerciale et RGPD", "Éviter toute information sélective avant notification officielle"],
        phase: "comms", targetRoles: ["DPO", "Direction", "Commercial"],
      },
      {
        order: 6, offsetMin: 50, channel: "ALERT", priority: "NORMAL",
        senderPersona: "Veille Médias",
        body: "DÉTECTION — Un forum cybersécurité underground mentionne 'FR company customer DB leak 2024'. Pas encore de données publiées mais l'information circule. ETA publication potentielle : 24-48h. Cela accélère l'impératif de communication proactive.",
        expectedActions: ["Accélérer la notification CNIL", "Préparer la communication externe", "Informer la direction du risque médiatique"],
        phase: "comms",
      },
      {
        order: 7, offsetMin: 65, channel: "FLASH_INFO", priority: "NORMAL",
        senderPersona: "Coordinateur crise RGPD",
        body: "BILAN T+65min (T0+3h15 réel) : Notification CNIL télénotification.cnil.fr soumise ✅ Credentials compromis révoqués ✅ MFA activé sur tous les comptes admin ✅ Communication 1 243 personnes données santé en cours de rédaction ✅ Analyse risque 46 589 autres : en cours. Prochain point dans 2h.",
        expectedActions: ["Suivre la réponse CNIL", "Finaliser les communications", "Préparer le plan de remédiation"],
        phase: "recovery",
      },
    ],
    roles: [
      { role: "DPO", team: "RGPD", description: "Délégué à la Protection des Données — coordinateur de la réponse RGPD", isRequired: true },
      { role: "RSSI", team: "Cyber", description: "Analyse technique de la violation", isRequired: true },
      { role: "Direction Générale", team: "Décision", description: "Décisions stratégiques et engagement de l'organisation", isRequired: true },
      { role: "Responsable Juridique", team: "Juridique", description: "Conseil RGPD et relations avec la CNIL", isRequired: false },
    ],
    evaluationConfig: [
      { name: "Réactivité RGPD", weight: 25, category: "timing", description: "Respect du délai 72h notification CNIL" },
      { name: "Conformité RGPD", weight: 30, category: "conformity", description: "Respect des obligations Art. 33 et 34" },
      { name: "Qualité analyse", weight: 25, category: "decision", description: "Rigueur de l'analyse et qualification de la violation" },
      { name: "Communication", weight: 20, category: "communication", description: "Clarté et transparence des communications" },
    ],
    tags: ["RGPD", "DPO", "données personnelles", "CNIL", "cyber"],
    icon: "ShieldOff",
    color: "#993556",
    bg: "#FBEAF0",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. PHYSICAL DISASTER (Incendie / Inondation)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-physical",
    title: "Sinistre Physique",
    description: "Incendie ou inondation sur site — évacuation, gestion des premières heures et activation du plan de continuité d'activité.",
    scenario: "PHYSICAL_DISASTER",
    duration_min: 90,
    difficulty: "MEDIUM",
    objectives: [
      "Tester l'activation du Plan de Continuité d'Activité (PCA)",
      "Valider les procédures d'évacuation et de sécurisation",
      "Tester la mise en place des solutions de secours",
      "Évaluer la communication avec les parties prenantes externes",
    ],
    briefingText: "Vous allez gérer un sinistre physique majeur impactant votre site principal. L'objectif est d'activer le PCA et de maintenir un niveau minimal d'activité pour les processus critiques.",
    scenarioContext: "Un dégât des eaux important suite à la rupture d'une canalisation au 3ème étage du bâtiment principal a inondé partiellement les salles serveurs du 2ème étage. L'électricité a été coupée en urgence. 150 collaborateurs ont été évacués. Les premières estimations parlent de 24 à 72h avant retour au site.",
    injectSequence: [
      {
        order: 1, offsetMin: 0, channel: "ALERT", priority: "CRITICAL",
        senderPersona: "Agent de Sécurité",
        body: "🚨 SINISTRE — Inondation salle serveurs N2. Électricité coupée d'urgence. 150 collaborateurs évacués, tous en sécurité. Pompiers sur place. Accès bâtiment interdit. Évaluation dommages en cours. PCA À ACTIVER.",
        expectedActions: ["Confirmer que tout le monde est en sécurité", "Activer le PCA", "Contacter l'assureur"],
        phase: "detection",
      },
      {
        order: 2, offsetMin: 10, channel: "SMS", priority: "HIGH",
        senderPersona: "DSI",
        body: "Serveurs physiquement endommagés. On perd le datacenter principal. Datacenter de secours activable mais délai 4-6h. Les laptops des collaborateurs sont sauvés. Teams/M365 cloud fonctionnel. On peut mettre les gens en télétravail.",
        expectedActions: ["Activer le plan de continuité IT", "Organiser le télétravail", "Prioriser la reprise des applications critiques"],
        phase: "detection", targetRoles: ["BCM", "DSI"],
      },
      {
        order: 3, offsetMin: 15, channel: "EMAIL", priority: "HIGH",
        senderPersona: "DRH",
        subject: "Gestion des 150 collaborateurs évacués",
        body: "Les collaborateurs sont dans le parking. Certains n'ont pas leur matériel. La météo est froide. Plusieurs posent des questions sur la suite. Je prévois de louer une salle de réunion à l'hôtel d'à côté pour les prochaines heures. On active le télétravail pour tous ? Certains n'ont pas de bonne connexion à domicile. Que communique-t-on officiellement ?",
        expectedActions: ["Organiser l'accueil des collaborateurs", "Définir les modalités de travail", "Communiquer sur la situation"],
        phase: "escalation", targetRoles: ["BCM", "DRH", "Direction"],
      },
      {
        order: 4, offsetMin: 25, channel: "CALL", priority: "HIGH",
        senderPersona: "Client Prioritaire — Grand Compte",
        body: "Bonjour, j'ai tenté de vous joindre depuis ce matin sans succès. Nous avons une livraison critique attendue cet après-midi que votre équipe doit valider. Je vois sur les réseaux qu'il y a un sinistre sur votre site. Qu'est-ce qui se passe et quand pouvez-vous valider notre commande ?",
        expectedActions: ["Rassurer le client", "Identifier une solution de continuité", "Déléguer à une équipe disponible"],
        phase: "comms", targetRoles: ["BCM", "Commercial"],
      },
      {
        order: 5, offsetMin: 40, channel: "EMAIL", priority: "NORMAL",
        senderPersona: "Assureur — Courtier Corporate",
        subject: "Ouverture dossier sinistre — documents requis",
        body: "Suite à votre déclaration, nous ouvrons le dossier sinistre. Pour traitement accéléré, transmettez : rapport pompiers, inventaire des dommages (matériel IT, mobilier, documents), impact sur l'activité (CA journalier à risque), mesures prises. Un expert sera sur site demain 9h. Votre garantie inclut : frais de relogement, matériel de remplacement, perte d'exploitation 30 jours.",
        expectedActions: ["Constituer le dossier sinistre", "Évaluer les dommages", "Préserver les preuves pour l'expert"],
        phase: "legal", targetRoles: ["BCM", "Direction", "Finance"],
      },
      {
        order: 6, offsetMin: 55, channel: "SMS", priority: "NORMAL",
        senderPersona: "Responsable Facilities",
        body: "Expert bâtiment a évalué : retour au bâtiment possible dans 48-72h minimum. J'ai trouvé un site de repli chez notre partenaire ABC à 5km, 80 postes disponibles dès demain matin. Coût : 800€/jour. On prend ?",
        expectedActions: ["Valider le site de repli", "Organiser la logistique", "Communiquer aux collaborateurs"],
        phase: "recovery", targetRoles: ["BCM", "DRH", "Direction"],
      },
      {
        order: 7, offsetMin: 75, channel: "FLASH_INFO", priority: "NORMAL",
        senderPersona: "Coordinateur PCA",
        body: "BILAN T+75min — Collaborateurs : télétravail activé pour 120, 30 sur site repli dès demain ✅ IT : datacenter secours opérationnel (ERP, messagerie, CRM) ✅ Client prioritaire : commande gérée ✅ Assureur : dossier ouvert, expert demain ✅ Site repli : confirmé pour J+1. Communication collaborateurs : envoyée. Reprise partielle d'activité : en cours.",
        expectedActions: ["Suivre le plan de retour sur site", "Communiquer sur les délais", "Documenter les leçons apprises"],
        phase: "recovery",
      },
    ],
    roles: [
      { role: "Responsable BCM", team: "Cellule PCA", description: "Coordinateur global du Plan de Continuité", isRequired: true },
      { role: "DSI", team: "Cellule PCA", description: "Reprise informatique", isRequired: true },
      { role: "DRH", team: "Cellule PCA", description: "Gestion des collaborateurs et site de repli", isRequired: true },
      { role: "Direction Générale", team: "Décision", description: "Arbitrages et communication externe", isRequired: false },
    ],
    evaluationConfig: [
      { name: "Réactivité PCA", weight: 25, category: "timing", description: "Délai d'activation du PCA" },
      { name: "Conformité PCA", weight: 25, category: "conformity", description: "Respect des procédures du Plan de Continuité" },
      { name: "Gestion humaine", weight: 25, category: "decision", description: "Prise en charge des collaborateurs" },
      { name: "Communication", weight: 25, category: "communication", description: "Parties prenantes internes et externes" },
    ],
    tags: ["sinistre", "incendie", "PCA", "reprise", "continuité"],
    icon: "Flame",
    color: "#854F0B",
    bg: "#FAEEDA",
  },
];

// ─── Template lookup helpers ──────────────────────────────────────────────────

export function getTemplateById(id: string): SimTemplate | undefined {
  return BUILTIN_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByScenario(scenario: string): SimTemplate[] {
  return BUILTIN_TEMPLATES.filter(t => t.scenario === scenario);
}

export const TEMPLATE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  RANSOMWARE:             { label: "Ransomware",           icon: "Lock",         color: "#A32D2D", bg: "#FCEBEB" },
  DATACENTER_OUTAGE:      { label: "Panne Datacenter",     icon: "Server",       color: "#534AB7", bg: "#EEEDFE" },
  COMMUNICATION_CRISIS:   { label: "Crise Communication",  icon: "MessageSquare",color: "#185FA5", bg: "#E6F1FB" },
  CYBER_DATA_BREACH:      { label: "Fuite de données",     icon: "ShieldOff",    color: "#993556", bg: "#FBEAF0" },
  PHYSICAL_DISASTER:      { label: "Sinistre Physique",    icon: "Flame",        color: "#854F0B", bg: "#FAEEDA" },
  SUPPLY_CHAIN:           { label: "Supply Chain",         icon: "Truck",        color: "#3B6D11", bg: "#EAF3DE" },
  HR_CRISIS:              { label: "Crise RH",             icon: "Users",        color: "#0F6E56", bg: "#E1F5EE" },
  CUSTOM:                 { label: "Personnalisé",         icon: "Settings2",    color: "#5F5E5A", bg: "#F1EFE8" },
};

export const PHASE_CONFIG: Record<InjectPhase, { label: string; color: string; bg: string }> = {
  detection:   { label: "Détection",    color: "#534AB7", bg: "#EEEDFE" },
  containment: { label: "Confinement",  color: "#A32D2D", bg: "#FCEBEB" },
  escalation:  { label: "Escalade",     color: "#993556", bg: "#FBEAF0" },
  recovery:    { label: "Reprise",      color: "#0F6E56", bg: "#E1F5EE" },
  comms:       { label: "Communication",color: "#185FA5", bg: "#E6F1FB" },
  legal:       { label: "Légal",        color: "#854F0B", bg: "#FAEEDA" },
  debrief:     { label: "Debrief",      color: "#5F5E5A", bg: "#F1EFE8" },
};
