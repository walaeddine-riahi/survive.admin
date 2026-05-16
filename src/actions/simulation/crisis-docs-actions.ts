"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CrisisDocCategory } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocSection {
  id: string;
  title: string;
  content: string;
  isKeyProcedure?: boolean;  // Highlighted sections — key steps
}

export interface DocContact {
  name: string;
  role: string;
  phone: string;
  email?: string;
  priority: "primary" | "backup";
  availability: string;  // "24/7" | "Heures ouvrées" | "Astreinte"
  notes?: string;
}

// ─── Seed default documents for a simulation ─────────────────────────────────

export async function seedDefaultDocs(simulationId: string, scenarioType?: string) {
  try {
    const existing = await prisma.crisisDocument.count({ where: { simulationId } });
    if (existing > 0) return { success: true, message: "Docs already exist" };

    const docs = getDefaultDocuments(scenarioType);

    await prisma.crisisDocument.createMany({
      data: docs.map(d => ({
        simulationId,
        title: d.title,
        description: d.description,
        category: d.category as CrisisDocCategory,
        tags: d.tags,
        content: d.content,
        sections: d.sections as object[],
        contacts: (d.contacts || null) as object[] | null,
        isCritical: d.isCritical ?? false,
        isPinned: d.isPinned ?? false,
        visibleToRoles: d.visibleToRoles ?? [],
      })),
    });

    revalidatePath(`/simulation`);
    return { success: true, count: docs.length };
  } catch (error) {
    console.error("seedDefaultDocs:", error);
    return { success: false, error: "Erreur création documents" };
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getDocs(simulationId: string, participantRole?: string) {
  try {
    const docs = await prisma.crisisDocument.findMany({
      where: {
        simulationId,
        isActive: true,
        instructorOnly: false,
        ...(participantRole ? {
          OR: [
            { visibleToRoles: { isEmpty: true } },
            { visibleToRoles: { has: participantRole } },
          ],
        } : {}),
      },
      select: {
        id: true, title: true, description: true, category: true,
        tags: true, version: true, isPinned: true, isCritical: true,
        visibleToRoles: true, consultationCount: true, updatedAt: true,
        attachmentUrl: true, attachmentName: true,
        _count: { select: { consultations: true } },
      },
      orderBy: [{ isPinned: "desc" }, { isCritical: "desc" }, { category: "asc" }, { title: "asc" }],
    });
    return { success: true, data: docs };
  } catch (error) {
    return { success: false, error: "Erreur récupération documents" };
  }
}

export async function getDocContent(docId: string) {
  try {
    const doc = await prisma.crisisDocument.findUnique({ where: { id: docId } });
    return { success: true, data: doc };
  } catch {
    return { success: false, error: "Erreur récupération document" };
  }
}

export async function createDoc(input: {
  simulationId: string;
  title: string;
  description?: string;
  category: CrisisDocCategory;
  tags?: string[];
  content: string;
  sections?: DocSection[];
  contacts?: DocContact[];
  isCritical?: boolean;
  isPinned?: boolean;
  visibleToRoles?: string[];
  createdById?: string;
}) {
  try {
    const doc = await prisma.crisisDocument.create({
      data: {
        simulationId: input.simulationId,
        title: input.title,
        description: input.description,
        category: input.category,
        tags: input.tags ?? [],
        content: input.content,
        sections: (input.sections ?? []) as object[],
        contacts: (input.contacts ?? null) as object[] | null,
        isCritical: input.isCritical ?? false,
        isPinned: input.isPinned ?? false,
        visibleToRoles: input.visibleToRoles ?? [],
        createdById: input.createdById,
      },
    });
    revalidatePath(`/simulation`);
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error: "Erreur création document" };
  }
}

export async function updateDoc(id: string, data: Partial<Parameters<typeof createDoc>[0]>) {
  try {
    const doc = await prisma.crisisDocument.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.tags && { tags: data.tags }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.sections && { sections: data.sections as object[] }),
        ...(data.contacts !== undefined && { contacts: (data.contacts ?? null) as object[] | null }),
        ...(data.isCritical !== undefined && { isCritical: data.isCritical }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
        ...(data.visibleToRoles && { visibleToRoles: data.visibleToRoles }),
      },
    });
    return { success: true, data: doc };
  } catch {
    return { success: false, error: "Erreur mise à jour" };
  }
}

export async function deleteDoc(id: string) {
  try {
    await prisma.crisisDocument.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur suppression" };
  }
}

// ─── Fulltext search ──────────────────────────────────────────────────────────

export async function searchDocs(simulationId: string, query: string, participantRole?: string) {
  try {
    if (!query.trim()) return getDocs(simulationId, participantRole);

    const q = query.toLowerCase().trim();
    const docs = await prisma.crisisDocument.findMany({
      where: {
        simulationId,
        isActive: true,
        instructorOnly: false,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      select: {
        id: true, title: true, description: true, category: true,
        tags: true, isPinned: true, isCritical: true, content: true,
      },
    });

    // Simple relevance scoring + excerpt extraction
    const results = docs.map(d => {
      const contentLower = d.content.toLowerCase();
      const idx = contentLower.indexOf(q);
      const excerpt = idx !== -1
        ? "..." + d.content.slice(Math.max(0, idx - 60), idx + 120) + "..."
        : d.description || d.content.slice(0, 150) + "...";

      return {
        ...d,
        excerpt: excerpt.replace(/\n/g, " "),
        relevance: (d.title.toLowerCase().includes(q) ? 3 : 0) +
                   (d.tags.some(t => t.toLowerCase().includes(q)) ? 2 : 0) +
                   (contentLower.includes(q) ? 1 : 0),
      };
    }).sort((a, b) => b.relevance - a.relevance);

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: "Erreur recherche" };
  }
}

// ─── Track consultation ───────────────────────────────────────────────────────

export async function trackDocOpen(input: {
  documentId: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  searchQuery?: string;
}) {
  try {
    const consultation = await prisma.docConsultation.create({
      data: {
        documentId: input.documentId,
        sessionId: input.sessionId,
        participantId: input.participantId,
        participantName: input.participantName,
        participantRole: input.participantRole,
        searchQuery: input.searchQuery,
        openedAt: new Date(),
      },
    });

    // Increment counter
    await prisma.crisisDocument.update({
      where: { id: input.documentId },
      data: { consultationCount: { increment: 1 } },
    });

    return { success: true, consultationId: consultation.id };
  } catch {
    return { success: false, error: "Erreur tracking" };
  }
}

export async function trackDocClose(consultationId: string, sectionsViewed: string[]) {
  try {
    const cons = await prisma.docConsultation.findUnique({
      where: { id: consultationId },
      select: { openedAt: true },
    });
    const duration = cons
      ? Math.round((Date.now() - new Date(cons.openedAt).getTime()) / 1000)
      : 0;

    await prisma.docConsultation.update({
      where: { id: consultationId },
      data: { closedAt: new Date(), durationSeconds: duration, sectionsViewed },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

// ─── Stats for instructor ─────────────────────────────────────────────────────

export async function getDocStats(sessionId: string, simulationId: string) {
  try {
    const [consultations, docs] = await Promise.all([
      prisma.docConsultation.findMany({
        where: { sessionId },
        include: { document: { select: { title: true, category: true, isCritical: true } } },
        orderBy: { openedAt: "desc" },
      }),
      prisma.crisisDocument.findMany({
        where: { simulationId, isActive: true, isCritical: true },
        select: { id: true, title: true, category: true },
      }),
    ]);

    // Critical docs not consulted
    const consultedDocIds = new Set(consultations.map(c => c.documentId));
    const unconsultedCritical = docs.filter(d => !consultedDocIds.has(d.id));

    // Per-participant stats
    const byParticipant = consultations.reduce((acc: Record<string, {
      name: string; role: string; count: number; totalSeconds: number; docs: string[];
    }>, c) => {
      const key = c.participantId;
      if (!acc[key]) acc[key] = { name: c.participantName, role: c.participantRole, count: 0, totalSeconds: 0, docs: [] };
      acc[key].count++;
      acc[key].totalSeconds += c.durationSeconds || 0;
      if (!acc[key].docs.includes(c.document.title)) acc[key].docs.push(c.document.title);
      return acc;
    }, {});

    // Per-document stats
    const byDocument = consultations.reduce((acc: Record<string, {
      title: string; count: number; avgSeconds: number; participants: string[];
    }>, c) => {
      const key = c.documentId;
      if (!acc[key]) acc[key] = { title: c.document.title, count: 0, avgSeconds: 0, participants: [] };
      acc[key].count++;
      acc[key].avgSeconds = Math.round(((acc[key].avgSeconds * (acc[key].count - 1)) + (c.durationSeconds || 0)) / acc[key].count);
      if (!acc[key].participants.includes(c.participantName)) acc[key].participants.push(c.participantName);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        totalConsultations: consultations.length,
        uniqueParticipants: Object.keys(byParticipant).length,
        unconsultedCritical,
        byParticipant,
        byDocument,
        recentConsultations: consultations.slice(0, 10),
      },
    };
  } catch (error) {
    return { success: false, error: "Erreur stats documents" };
  }
}

// ─── Default document templates by scenario ───────────────────────────────────

function getDefaultDocuments(scenarioType?: string) {
  const common = [
    {
      title: "Annuaire de crise",
      description: "Contacts prioritaires de la cellule de crise et partenaires externes",
      category: "ANNUAIRE",
      tags: ["contacts", "urgence", "cellule de crise"],
      isCritical: true,
      isPinned: true,
      content: `# Annuaire de crise\n\nContacts à activer en priorité lors d'une situation de crise.`,
      sections: [
        { id: "s1", title: "Cellule de crise interne", content: "Contacts des membres de la cellule de crise", isKeyProcedure: true },
        { id: "s2", title: "Contacts externes prioritaires", content: "CERT-FR, ANSSI, Assureur cyber, Prestataires" },
        { id: "s3", title: "Autorités", content: "CNIL, ANSSI, Police, Pompiers" },
      ],
      contacts: [
        { name: "Directeur Général", role: "DG", phone: "+33 6 XX XX XX XX", priority: "primary", availability: "24/7", notes: "Décisions stratégiques" },
        { name: "RSSI", role: "Responsable Sécurité SI", phone: "+33 6 XX XX XX XX", priority: "primary", availability: "24/7", notes: "Incidents cyber" },
        { name: "DSI", role: "Directeur SI", phone: "+33 6 XX XX XX XX", priority: "primary", availability: "24/7" },
        { name: "Responsable BCM", role: "Business Continuity Manager", phone: "+33 6 XX XX XX XX", priority: "primary", availability: "24/7" },
        { name: "CERT-FR", role: "Autorité nationale cyber", phone: "+33 1 71 75 84 68", email: "cert@ssi.gouv.fr", priority: "primary", availability: "24/7" },
        { name: "Assureur Cyber", role: "Gestion sinistre", phone: "+33 1 XX XX XX XX", priority: "backup", availability: "Astreinte" },
      ],
    },
    {
      title: "Procédure d'activation de la cellule de crise",
      description: "Étapes à suivre pour activer la cellule de crise en moins de 15 minutes",
      category: "PROCEDURE",
      tags: ["activation", "cellule de crise", "urgence"],
      isCritical: true,
      content: `# Procédure d'activation de la cellule de crise\n\n**Objectif** : Activer la cellule de crise en moins de 15 minutes dès détection d'un incident majeur.\n\n## Déclencheurs\n\nCette procédure est activée si l'un des critères suivants est rempli :\n- Système critique indisponible depuis plus de 30 minutes\n- Compromission de données clients ou confidentielles\n- Impact sur la production avec risque RTO dépassé\n- Incident médiatique ou réglementaire\n\n## Étapes\n\n### 1. Notification initiale (0–5 min)\nLe détecteur de l'incident notifie immédiatement le Responsable BCM via le canal d'urgence défini.\n\n### 2. Qualification (5–10 min)\nLe Responsable BCM évalue la gravité selon la grille d'impact et décide d'activer ou non la cellule.\n\n### 3. Convocation (10–15 min)\nSi activation : tous les membres sont convoqués via SMS d'urgence. Lieu de réunion : salle de crise principale ou plateforme SURVIVE.`,
      sections: [
        { id: "s1", title: "Déclencheurs", content: "Critères d'activation", isKeyProcedure: true },
        { id: "s2", title: "Notification initiale (0-5 min)", content: "Qui notifie qui", isKeyProcedure: true },
        { id: "s3", title: "Qualification (5-10 min)", content: "Grille d'impact et décision d'activation" },
        { id: "s4", title: "Convocation (10-15 min)", content: "Comment convoquer les membres" },
      ],
    },
    {
      title: "Grille d'impact et de criticité",
      description: "Grille de qualification de la gravité d'un incident — niveaux 1 à 4",
      category: "REFERENCE",
      tags: ["impact", "criticité", "qualification", "ISO 22301"],
      content: `# Grille d'impact et de criticité\n\nRéférence ISO 22301 §8.2.3\n\n## Niveau 1 — Incident mineur\n**Impact** : Perturbation limitée, RTO non menacé\n**Exemples** : Panne d'un poste de travail, incident logiciel isolé\n**Réponse** : Équipe IT standard\n\n## Niveau 2 — Incident significatif\n**Impact** : Dégradation d'un service, RTO à surveiller\n**Exemples** : Serveur secondaire indisponible, incident réseau\n**Réponse** : RSSI + DSI alertés\n\n## Niveau 3 — Crise opérationnelle\n**Impact** : Service critique indisponible, RTO menacé\n**Exemples** : Ransomware, panne datacenter, fuite de données\n**Réponse** : Cellule de crise activée\n\n## Niveau 4 — Crise majeure\n**Impact** : Impact sur la continuité globale, réglementaire ou médiatique\n**Exemples** : Destruction datacenter, compromission totale AD, crise médias\n**Réponse** : Direction Générale + cellule de crise + communication externe`,
      sections: [
        { id: "n1", title: "Niveau 1 — Incident mineur", content: "Perturbation limitée" },
        { id: "n2", title: "Niveau 2 — Incident significatif", content: "Dégradation service" },
        { id: "n3", title: "Niveau 3 — Crise opérationnelle", content: "Service critique indisponible", isKeyProcedure: true },
        { id: "n4", title: "Niveau 4 — Crise majeure", content: "Impact global", isKeyProcedure: true },
      ],
    },
    {
      title: "Modèles de communication de crise",
      description: "Trames de communication pour les différents publics : salariés, clients, médias, autorités",
      category: "COMMUNICATION",
      tags: ["communication", "médias", "salariés", "clients", "templates"],
      content: `# Modèles de communication de crise\n\n## Communication interne — Salariés\n\n**Objet** : [SITUATION DE CRISE] — Information des équipes\n\nMesdames, Messieurs,\n\nNous faisons face à un incident [nature générale] depuis [heure]. La cellule de crise est activée et travaille à la résolution de la situation.\n\nEn attendant le retour à la normale :\n- [Instruction 1]\n- [Instruction 2]\n\nUne mise à jour vous sera communiquée dans [délai].\n\n---\n\n## Communication externe — Clients\n\n**Objet** : Information importante — [Nom du service]\n\nNous rencontrons actuellement une perturbation technique affectant [service]. Nos équipes sont pleinement mobilisées.\n\nNous vous tiendrons informés dès que la situation sera rétablie. Nous vous prions de nous excuser pour la gêne occasionnée.\n\n---\n\n## Déclaration presse minimale\n\n"[Nom de l'organisation] est au courant de [situation]. Nos équipes sont mobilisées et nous mettons tout en œuvre pour rétablir la situation dans les meilleurs délais. Nous n'avons pas de commentaire supplémentaire à ce stade et communiquerons dès que possible."\n\n---\n\n## Notification CNIL (violation de données)\n\nCe template ne remplace pas le conseil juridique. À utiliser comme base sur https://notifications.cnil.fr`,
      sections: [
        { id: "int", title: "Communication interne — Salariés", content: "Template message interne", isKeyProcedure: false },
        { id: "ext", title: "Communication externe — Clients", content: "Template message clients" },
        { id: "press", title: "Déclaration presse minimale", content: "Template presse — à valider avant envoi", isKeyProcedure: true },
        { id: "cnil", title: "Notification CNIL", content: "Base notification violation données" },
      ],
    },
  ];

  const cyberDocs = [
    {
      title: "Procédure de réponse à incident cyber",
      description: "Étapes techniques de confinement, éradication et reprise suite à un incident cyber",
      category: "PROCEDURE",
      tags: ["cyber", "incident", "RSSI", "SOC", "confinement"],
      isCritical: true,
      visibleToRoles: ["RSSI", "DSI", "Responsable IT", "Analyste SOC"],
      content: `# Procédure de réponse à incident cyber\n\nRéférence : NIST SP 800-61r2 + ANSSI PRIS\n\n## Phase 1 — Détection et qualification (T+0 à T+30min)\n\n### Checklist immédiate\n- [ ] Identifier et documenter les systèmes affectés\n- [ ] Évaluer la nature de l'incident (ransomware, intrusion, exfiltration...)\n- [ ] Prendre des captures d'écran et logs avant toute action\n- [ ] NE PAS éteindre les systèmes compromis (sauf propagation active)\n- [ ] Notifier le RSSI et le Responsable BCM\n\n## Phase 2 — Confinement (T+30min à T+2h)\n\n### Actions techniques prioritaires\n1. Isoler les systèmes compromis du réseau (quarantaine réseau, non extinction)\n2. Bloquer les communications C2 identifiées au firewall\n3. Révoquer les comptes compromis / changer les mots de passe critiques\n4. Suspendre les sauvegardes automatiques (risque de sauvegarder données chiffrées)\n5. Activer la journalisation étendue sur tous les systèmes\n\n## Phase 3 — Analyse (T+2h à T+8h)\n\n- Analyse des logs : authentification, réseau, processus\n- Identification du vecteur initial (phishing, VPN, RDP...)\n- Cartographie de la propagation latérale\n- Collecte des IOCs (hashes, IPs, domaines, comptes)\n\n## Phase 4 — Éradication et reprise (T+8h+)\n\n- Validation que les systèmes de sauvegarde sont sains\n- Restauration depuis backup offline validé\n- Changement de tous les credentials (AD, service accounts, secrets)\n- Déploiement des patches manquants\n- Surveillance renforcée post-incident (30 jours minimum)`,
      sections: [
        { id: "p1", title: "Phase 1 — Détection et qualification", content: "T+0 à T+30min", isKeyProcedure: true },
        { id: "p2", title: "Phase 2 — Confinement", content: "T+30min à T+2h", isKeyProcedure: true },
        { id: "p3", title: "Phase 3 — Analyse forensique", content: "T+2h à T+8h" },
        { id: "p4", title: "Phase 4 — Éradication et reprise", content: "T+8h+" },
      ],
    },
    {
      title: "Fiche réflexe — Ransomware",
      description: "Actions immédiates en cas de détection ransomware — première heure critique",
      category: "FICHE_REFLEXE",
      tags: ["ransomware", "urgence", "premiers secours", "cyber"],
      isCritical: true,
      isPinned: true,
      content: `# 🚨 Fiche réflexe — Ransomware\n\n## FAIRE en priorité\n\n✅ **Isoler immédiatement** les machines affectées du réseau (débrancher le câble ethernet, désactiver le Wi-Fi)\n✅ **NE PAS éteindre** les machines (perte de mémoire volatile = perte d'indices forensiques)\n✅ **Notifier** le RSSI, DSI, Responsable BCM dans les 5 minutes\n✅ **Documenter** tout ce qui est visible (photos des écrans, messages de rançon)\n✅ **Vérifier** si les sauvegardes offline sont intactes\n✅ **Suspendre** les sauvegardes automatiques en cours\n\n## NE PAS FAIRE\n\n❌ **Ne pas payer** la rançon (aucune garantie de récupération, finance les criminels)\n❌ **Ne pas redémarrer** les systèmes affectés\n❌ **Ne pas supprimer** de fichiers (même les notes de rançon)\n❌ **Ne pas communiquer** publiquement sans validation Direction + Juridique\n❌ **Ne pas se déconnecter** du VPN ou des outils de gestion à distance (risque de perdre l'accès)\n\n## Contacts immédiats\n- RSSI : voir Annuaire de crise\n- CERT-FR : +33 1 71 75 84 68\n- Assureur cyber : voir Annuaire de crise`,
      sections: [
        { id: "do", title: "Actions PRIORITAIRES", content: "Ce qu'il faut faire immédiatement", isKeyProcedure: true },
        { id: "dont", title: "À NE PAS FAIRE", content: "Erreurs à éviter absolument", isKeyProcedure: true },
        { id: "contacts", title: "Contacts immédiats", content: "Qui appeler en premier" },
      ],
    },
    {
      title: "Obligations RGPD — Violation de données",
      description: "Checklist des obligations légales en cas de violation de données personnelles (Art. 33 et 34 RGPD)",
      category: "REFERENCE",
      tags: ["RGPD", "CNIL", "DPO", "violation", "notification", "légal"],
      isCritical: true,
      visibleToRoles: ["DPO", "Responsable Juridique", "Direction"],
      content: `# Obligations RGPD — Violation de données\n\nRéférence : RGPD Art. 33 et 34 — Règlement (UE) 2016/679\n\n## ⏱ Délai critique : 72 heures\n\nL'heure zéro (T0) est **l'heure de détection** (pas l'heure de l'incident).\n\n## Checklist Art. 33 — Notification CNIL (obligatoire si risque)\n\n- [ ] **Qualifier** : la violation constitue-t-elle un risque pour les droits des personnes ?\n- [ ] **Notifier** la CNIL via https://notifications.cnil.fr avant T+72h\n- [ ] **Documenter** : nature de la violation, catégories et nombre de personnes concernées, catégories et volume de données, conséquences probables, mesures prises\n\n### À indiquer dans la notification\n1. Nature de la violation (confidentialité, intégrité, disponibilité)\n2. Catégories et nombre approximatif de personnes concernées\n3. Catégories et nombre approximatif d'enregistrements\n4. Coordonnées du DPO\n5. Conséquences probables\n6. Mesures prises ou envisagées\n\n## Checklist Art. 34 — Communication aux personnes (si risque élevé)\n\n- [ ] **Évaluer** si le risque pour les personnes est élevé (données de santé, biométrie, financières, mineurs...)\n- [ ] **Communiquer** sans délai aux personnes concernées si risque élevé\n- [ ] **Contenu** : nature de la violation, coordonnées DPO, conséquences probables, mesures prises\n\n## Exceptions à la communication Art. 34\nPas de notification aux personnes si :\n- Les données étaient chiffrées (si clé non compromise)\n- Des mesures ont rendu les données inintelligibles\n- La communication nécessiterait un effort disproportionné → communication publique à la place`,
      sections: [
        { id: "delai", title: "Délai critique 72h", content: "Calcul du délai et T0", isKeyProcedure: true },
        { id: "art33", title: "Art. 33 — Notification CNIL", content: "Checklist et contenu", isKeyProcedure: true },
        { id: "art34", title: "Art. 34 — Notification personnes", content: "Quand et comment notifier" },
        { id: "exceptions", title: "Exceptions", content: "Cas de dispense de notification" },
      ],
    },
  ];

  const otDocs = [
    {
      title: "Procédure d'arrêt d'urgence OT",
      description: "Procédure d'arrêt sécurisé des équipements industriels en situation de crise",
      category: "OT_PROCEDURE",
      tags: ["OT", "SCADA", "arrêt urgence", "sécurité", "automates"],
      isCritical: true,
      visibleToRoles: ["Responsable Production", "Ingénieur OT", "RSSI"],
      content: `# Procédure d'arrêt d'urgence OT\n\n⚠️ **AVERTISSEMENT** : Cette procédure doit être réalisée uniquement par du personnel habilité. Un arrêt mal exécuté peut causer des dommages physiques aux équipements.\n\n## Séquence d'arrêt sécurisé\n\n### 1. Arrêt des processus actifs\n- Ramener toutes les vitesses de production à 0 (progressivement, ne pas couper brusquement)\n- Attendre la stabilisation des équipements mécaniques\n- Vérifier que tous les actionneurs sont en position sécurisée\n\n### 2. Isolation réseau OT\n- Déconnecter le réseau OT du réseau IT (si non isolé)\n- Activer le mode standalone sur les PLCs critiques\n- Désactiver les connexions de maintenance à distance\n\n### 3. Sauvegarde des configurations\n- Exporter la configuration des PLCs compromis\n- Documenter les valeurs des registres avant intervention\n\n### 4. Notification\n- Notifier le Responsable Production\n- Notifier le Responsable BCM (impact sur la continuité)\n- Documenter l'heure et la raison de l'arrêt dans le logbook`,
      sections: [
        { id: "warn", title: "Avertissement sécurité", content: "Personnel habilité uniquement", isKeyProcedure: true },
        { id: "seq", title: "Séquence d'arrêt sécurisé", content: "Étapes dans l'ordre", isKeyProcedure: true },
        { id: "notif", title: "Notifications", content: "Qui prévenir et quand" },
      ],
    },
  ];

  const base = [...common];
  if (scenarioType === "cyber" || scenarioType === "ransomware" || !scenarioType) {
    base.push(...cyberDocs);
  }
  if (scenarioType === "ot" || scenarioType === "physical") {
    base.push(...otDocs);
  }
  return base;
}
