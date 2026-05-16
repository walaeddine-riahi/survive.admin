// ─── Question types ───────────────────────────────────────────────────────────

export type QuestionType = "SCALE" | "TEXT" | "MULTIPLE_CHOICE" | "SINGLE_CHOICE" | "RATING_GRID";
export type FormType = "PRE_EXERCISE" | "POST_EXERCISE";

export interface QuestionDef {
  id: string;
  type: QuestionType;
  required: boolean;
  label: string;
  description?: string;
  // SCALE
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  // MULTIPLE_CHOICE / SINGLE_CHOICE
  options?: string[];
  // RATING_GRID
  gridRows?: string[];    // criteria
  gridCols?: string[];    // levels (1-5 labels)
  // Display
  group?: string;         // Section heading
  hint?: string;
}

export type FormAnswers = Record<string, string | number | string[] | Record<string, number>>;

// ─── Default PRÉ-exercise form ────────────────────────────────────────────────

export function getPreExerciseQuestions(scenarioTitle: string): QuestionDef[] {
  return [
    {
      id: "pre-01",
      type: "SCALE",
      required: true,
      label: "Quel est votre niveau de connaissance du Plan de Continuité d'Activité (PCA) de votre organisation ?",
      min: 1, max: 5,
      minLabel: "Je ne le connais pas",
      maxLabel: "Je le maîtrise parfaitement",
      group: "Connaissances",
    },
    {
      id: "pre-02",
      type: "SINGLE_CHOICE",
      required: true,
      label: "Quand avez-vous participé à votre dernier exercice de gestion de crise ?",
      options: [
        "Jamais",
        "Il y a plus de 2 ans",
        "Il y a 1 à 2 ans",
        "Il y a 6 à 12 mois",
        "Il y a moins de 6 mois",
      ],
      group: "Expérience",
    },
    {
      id: "pre-03",
      type: "RATING_GRID",
      required: true,
      label: "Évaluez votre niveau de maîtrise sur les points suivants :",
      gridRows: [
        "Procédures d'escalade et de notification",
        "Activation de la cellule de crise",
        "Communication en situation de crise",
        "Procédures de reprise d'activité",
        "Obligations légales et réglementaires",
      ],
      gridCols: ["1 — Novice", "2 — Débutant", "3 — Intermédiaire", "4 — Avancé", "5 — Expert"],
      group: "Auto-évaluation",
    },
    {
      id: "pre-04",
      type: "MULTIPLE_CHOICE",
      required: false,
      label: "Quels sont vos points d'inquiétude pour cet exercice ? (plusieurs réponses possibles)",
      options: [
        "Ne pas bien connaître mes responsabilités",
        "Manque de clarté sur les procédures",
        "Difficulté à communiquer sous pression",
        "Lacunes dans mes connaissances techniques",
        "Coordination avec les autres membres",
        "Prise de décision sous stress",
        "Aucune inquiétude particulière",
      ],
      group: "Attentes",
    },
    {
      id: "pre-05",
      type: "SINGLE_CHOICE",
      required: true,
      label: "Avez-vous relu le plan de crise ou vos procédures avant cet exercice ?",
      options: [
        "Oui, j'ai tout relu attentivement",
        "J'ai relu les points essentiels",
        "Je l'ai parcouru rapidement",
        "Non, je n'ai pas eu le temps",
        "Je n'ai pas accès au plan",
      ],
      group: "Préparation",
    },
    {
      id: "pre-06",
      type: "TEXT",
      required: false,
      label: "Avez-vous des attentes spécifiques pour cet exercice ? Y a-t-il un aspect particulier que vous souhaitez tester ?",
      hint: "Facultatif — votre réponse aide l'instructeur à adapter l'exercice",
      group: "Attentes",
    },
  ];
}

// ─── Default POST-exercise form ───────────────────────────────────────────────

export function getPostExerciseQuestions(
  scenarioTitle: string,
  participantRole: string,
  scenarioType?: string
): QuestionDef[] {
  return [
    // ── Évaluation de la simulation ────────────────────────────────────────────
    {
      id: "post-01",
      type: "SCALE",
      required: true,
      label: "Dans quelle mesure le scénario était-il réaliste par rapport à votre contexte opérationnel ?",
      min: 1, max: 5,
      minLabel: "Pas du tout réaliste",
      maxLabel: "Très réaliste",
      group: "Évaluation de la simulation",
    },
    {
      id: "post-02",
      type: "SCALE",
      required: true,
      label: "La durée de l'exercice était-elle appropriée ?",
      min: 1, max: 5,
      minLabel: "Beaucoup trop court",
      maxLabel: "Beaucoup trop long",
      group: "Évaluation de la simulation",
    },
    {
      id: "post-03",
      type: "SCALE",
      required: true,
      label: "Les injects (messages, appels, alertes) étaient-ils clairs et bien construits ?",
      min: 1, max: 5,
      minLabel: "Très peu clairs",
      maxLabel: "Très bien construits",
      group: "Évaluation de la simulation",
    },
    {
      id: "post-04",
      type: "SCALE",
      required: true,
      label: "La plateforme de simulation était-elle facile à utiliser ?",
      min: 1, max: 5,
      minLabel: "Très difficile",
      maxLabel: "Très intuitive",
      group: "Évaluation de la simulation",
    },

    // ── Auto-évaluation comportementale ────────────────────────────────────────
    {
      id: "post-05",
      type: "RATING_GRID",
      required: true,
      label: "Auto-évaluez votre propre performance pendant l'exercice :",
      gridRows: [
        "Réactivité (vitesse de réaction aux injects)",
        "Conformité aux procédures (respect du plan)",
        "Qualité des décisions (pertinence et rapidité)",
        "Communication (clarté, ciblage, ton)",
        "Leadership / Coordination avec l'équipe",
        "Gestion du stress (maîtrise émotionnelle)",
      ],
      gridCols: ["1 — Insuffisant", "2 — Passable", "3 — Correct", "4 — Bien", "5 — Excellent"],
      group: "Auto-évaluation individuelle",
    },
    {
      id: "post-06",
      type: "TEXT",
      required: true,
      label: "Quelle décision ou action êtes-vous le plus satisfait(e) d'avoir prise pendant l'exercice ?",
      hint: "Soyez précis — décrivez la situation et pourquoi vous pensez avoir bien réagi",
      group: "Auto-évaluation individuelle",
    },
    {
      id: "post-07",
      type: "TEXT",
      required: true,
      label: "Quelle est votre principale lacune identifiée pendant cet exercice ? Qu'auriez-vous dû faire différemment ?",
      hint: "Soyez honnête — cette réflexion est confidentielle et sert votre progression",
      group: "Auto-évaluation individuelle",
    },

    // ── Évaluation de l'équipe ─────────────────────────────────────────────────
    {
      id: "post-08",
      type: "RATING_GRID",
      required: true,
      label: "Évaluez le fonctionnement de l'équipe dans son ensemble :",
      gridRows: [
        "Coordination entre les membres",
        "Partage d'information en temps réel",
        "Prise de décision collective",
        "Respect des rôles et responsabilités",
        "Gestion de la pression collective",
      ],
      gridCols: ["1 — Insuffisant", "2 — Passable", "3 — Correct", "4 — Bien", "5 — Excellent"],
      group: "Évaluation de l'équipe",
    },
    {
      id: "post-09",
      type: "MULTIPLE_CHOICE",
      required: true,
      label: "Quelles difficultés de coordination avez-vous observées au sein de l'équipe ?",
      options: [
        "Manque de clarté sur qui doit décider",
        "Information non partagée à temps",
        "Doublon d'actions entre membres",
        "Sous-utilisation de certains membres",
        "Problèmes de communication entre équipes",
        "Difficultés à prioriser les actions",
        "Aucune difficulté majeure observée",
      ],
      group: "Évaluation de l'équipe",
    },

    // ── Lacunes plan de crise ──────────────────────────────────────────────────
    {
      id: "post-10",
      type: "MULTIPLE_CHOICE",
      required: true,
      label: "Quelles lacunes avez-vous identifiées dans le plan de crise / les procédures existantes ?",
      options: [
        "Procédures incomplètes ou manquantes",
        "Procédures difficiles à appliquer en situation réelle",
        "Contacts ou annuaire de crise incomplets ou obsolètes",
        "RTO / RPO irréalistes par rapport à la réalité opérationnelle",
        "Manque de clarté sur les rôles et responsabilités",
        "Absence de procédures de communication de crise",
        "Procédures techniques non testées (DRP, restauration)",
        "Aucune lacune majeure identifiée",
        "Autre",
      ],
      group: "Lacunes identifiées — Plan de crise",
    },
    {
      id: "post-11",
      type: "TEXT",
      required: false,
      label: "Décrivez les lacunes ou anomalies les plus importantes que vous avez observées :",
      hint: "Soyez spécifique — indiquez la section du plan concernée si vous la connaissez",
      group: "Lacunes identifiées — Plan de crise",
    },

    // ── Recommandations ────────────────────────────────────────────────────────
    {
      id: "post-12",
      type: "SCALE",
      required: true,
      label: "Globalement, dans quelle mesure cet exercice a-t-il renforcé votre confiance à gérer une vraie crise ?",
      min: 1, max: 5,
      minLabel: "Pas du tout",
      maxLabel: "Beaucoup plus confiant(e)",
      group: "Bilan et recommandations",
    },
    {
      id: "post-13",
      type: "SINGLE_CHOICE",
      required: true,
      label: "Quelle fréquence d'exercices recommanderiez-vous pour votre organisation ?",
      options: [
        "Trimestrielle (4 fois par an)",
        "Semestrielle (2 fois par an)",
        "Annuelle (1 fois par an)",
        "Bisannuelle (tous les 2 ans)",
        "Uniquement en cas de changement majeur",
      ],
      group: "Bilan et recommandations",
    },
    {
      id: "post-14",
      type: "TEXT",
      required: false,
      label: "Quelles sont vos recommandations pour améliorer le prochain exercice ?",
      hint: "Scénario, durée, participants, modalités, focus thématique...",
      group: "Bilan et recommandations",
    },
    {
      id: "post-15",
      type: "TEXT",
      required: false,
      label: "Avez-vous des commentaires libres sur l'exercice ?",
      group: "Bilan et recommandations",
    },
  ];
}

// ─── AI-enhanced post form question generator ─────────────────────────────────

export async function generateAIPostQuestions(input: {
  scenarioTitle: string;
  scenarioContext: string;
  participantRole: string;
  sessionDuration: number;
  injectCount: number;
}): Promise<QuestionDef[] | null> {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey   = process.env.AZURE_OPENAI_API_KEY;
    const deploy   = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
    const version  = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";
    if (!endpoint || !apiKey) return null;

    const res = await fetch(
      `${endpoint}openai/deployments/${deploy}/chat/completions?api-version=${version}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Tu es un expert BCM certifié ISO 22301 et concepteur d'exercices de gestion de crise.
Tu génères des questions de débrief post-exercice pertinentes et spécifiques au scénario vécu.
Réponds UNIQUEMENT en JSON valide, sans markdown.`,
            },
            {
              role: "user",
              content: `Génère 3 questions supplémentaires spécifiques à ce scénario pour le formulaire post-exercice.

Scénario: ${input.scenarioTitle}
Contexte: ${input.scenarioContext?.slice(0, 500)}
Rôle du participant: ${input.participantRole}
Durée: ${input.sessionDuration} minutes
Nombre d'injects: ${input.injectCount}

Les questions doivent :
- Être spécifiques aux enjeux de CE scénario (pas génériques)
- Cibler des moments précis de l'exercice que ce rôle a vécu
- Permettre d'identifier des lacunes actionables dans le plan de crise

Format JSON:
[{
  "id": "ai-q1",
  "type": "TEXT",
  "required": false,
  "label": "Question spécifique au scénario",
  "hint": "Aide contextuelle",
  "group": "Questions spécifiques au scénario"
}]`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      }
    );

    if (!res.ok) return null;
    const d = await res.json();
    const raw = d.choices?.[0]?.message?.content || "";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

// ─── Form group helpers ───────────────────────────────────────────────────────

export function groupQuestions(questions: QuestionDef[]): Map<string, QuestionDef[]> {
  const groups = new Map<string, QuestionDef[]>();
  for (const q of questions) {
    const g = q.group || "Général";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(q);
  }
  return groups;
}

export function computeAggregates(responses: Array<{ answers: FormAnswers }>, questions: QuestionDef[]) {
  const agg: Record<string, {
    type: QuestionType;
    label: string;
    avg?: number;
    distribution?: Record<string, number>;
    textResponses?: string[];
    gridAvg?: Record<string, number>;
  }> = {};

  for (const q of questions) {
    const answers = responses.map(r => r.answers[q.id]).filter(a => a !== undefined && a !== null && a !== "");

    if (q.type === "SCALE") {
      const nums = answers.map(a => Number(a)).filter(n => !isNaN(n));
      agg[q.id] = {
        type: q.type,
        label: q.label,
        avg: nums.length > 0 ? Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10 : undefined,
        distribution: nums.reduce((d, n) => { d[String(n)] = (d[String(n)] || 0) + 1; return d; }, {} as Record<string, number>),
      };
    } else if (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") {
      const dist: Record<string, number> = {};
      for (const a of answers) {
        const vals = Array.isArray(a) ? a : [String(a)];
        for (const v of vals) { dist[v] = (dist[v] || 0) + 1; }
      }
      agg[q.id] = { type: q.type, label: q.label, distribution: dist };
    } else if (q.type === "TEXT") {
      agg[q.id] = {
        type: q.type,
        label: q.label,
        textResponses: answers.map(a => String(a)).filter(a => a.trim()),
      };
    } else if (q.type === "RATING_GRID") {
      const gridAvg: Record<string, number> = {};
      if (q.gridRows) {
        for (const row of q.gridRows) {
          const vals = answers
            .map(a => (typeof a === "object" && !Array.isArray(a) ? (a as Record<string, number>)[row] : undefined))
            .filter(v => v !== undefined && !isNaN(Number(v)))
            .map(Number);
          gridAvg[row] = vals.length > 0
            ? Math.round((vals.reduce((s, n) => s + n, 0) / vals.length) * 10) / 10
            : 0;
        }
      }
      agg[q.id] = { type: q.type, label: q.label, gridAvg };
    }
  }

  return agg;
}
