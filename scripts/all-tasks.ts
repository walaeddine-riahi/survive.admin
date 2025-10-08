// Fichier contenant toutes les tâches organisées par rôle et par phase

export interface TaskDefinition {
  title: string;
  description: string;
  phase: 'Préparation' | 'Réponse' | 'Reprise';
  role: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export const ALL_TASKS: Record<string, TaskDefinition[]> = {
  // DGA (Directeur Général Adjoint)
  'DGA (Directeur Général Adjoint)': [
    {
      phase: 'Préparation',
      title: 'Préparation – DGA',
      description: 'Valide les orientations stratégiques du plan de gestion de crise, s\'assure de la mobilisation des ressources nécessaires.',
      role: 'DGA (Directeur Général Adjoint)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – DGA',
      description: 'Préside la cellule de crise, prend les décisions majeures, assure la coordination avec les autorités et le Groupe.',
      role: 'DGA (Directeur Général Adjoint)',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – DGA',
      description: 'Valide le plan de reprise globale, communique avec les parties prenantes clés, pilote le retour à la normale.',
      role: 'DGA (Directeur Général Adjoint)',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // DI (Directeur Industriel)
  'DI (Directeur Industriel)': [
    {
      phase: 'Préparation',
      title: 'Préparation – DI',
      description: 'Évalue les risques industriels majeurs, supervise la mise en conformité des installations critiques.',
      role: 'DI (Directeur Industriel)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – DI',
      description: 'Coordonne les opérations techniques en lien avec les équipes maintenance et production, priorise les actions de sécurisation.',
      role: 'DI (Directeur Industriel)',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – DI',
      description: 'Supervise le redémarrage sécurisé des outils de production, vérifie la conformité technique post-incident.',
      role: 'DI (Directeur Industriel)',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // Responsable Qualité
  'Responsable Qualité': [
    {
      phase: 'Préparation',
      title: 'Préparation – Qualité',
      description: 'Met à jour le plan de maîtrise sanitaire, organise les audits internes de préparation, forme les équipes qualité.',
      role: 'Responsable Qualité',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Qualité',
      description: 'Supervise la traçabilité, coordonne l\'analyse des échantillons critiques, assure le contrôle des non-conformités.',
      role: 'Responsable Qualité',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Qualité',
      description: 'Participe à l\'analyse des causes, valide la remise en conformité des produits et process, met à jour les procédures qualité.',
      role: 'Responsable Qualité',
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  ],
  
  // RSE (Responsable Développement Durable/RSE)
  'RSE (Responsable Développement Durable/RSE)': [
    {
      phase: 'Préparation',
      title: 'Préparation – RSE',
      description: 'Évalue les risques environnementaux, intègre les enjeux RSE dans les plans de prévention.',
      role: 'RSE (Responsable Développement Durable/RSE)',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – RSE',
      description: 'Suit les impacts environnementaux de l\'incident (eaux, déchets, émissions), alerte les autorités si besoin.',
      role: 'RSE (Responsable Développement Durable/RSE)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – RSE',
      description: 'Coordonne les actions de réparation écologique, intègre les leçons dans le reporting RSE.',
      role: 'RSE (Responsable Développement Durable/RSE)',
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  ],
  
  // DRH (Directeur des Ressources Humaines)
  'DRH (Directeur des Ressources Humaines)': [
    {
      phase: 'Préparation',
      title: 'Préparation – DRH',
      description: 'Met à jour les plans de continuité RH, supervise la formation des SST et la gestion des effectifs critiques.',
      role: 'DRH (Directeur des Ressources Humaines)',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – DRH',
      description: 'Prend en charge les équipes sur le plan administratif et psychologique, adapte les effectifs en fonction des besoins urgents.',
      role: 'DRH (Directeur des Ressources Humaines)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – DRH',
      description: 'Gère les retours d\'expérience RH, ajuste les politiques sociales en fonction des impacts.',
      role: 'DRH (Directeur des Ressources Humaines)',
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  ],
  
  // Responsable Production
  'Responsable Production': [
    {
      phase: 'Préparation',
      title: 'Préparation – Production',
      description: 'Met à jour les plannings et procédures de sécurité production, organise des exercices de simulation.',
      role: 'Responsable Production',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Production',
      description: 'Supervise l\'arrêt des lignes, assure la sécurité des équipes, coordonne les ajustements de cadence.',
      role: 'Responsable Production',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Production',
      description: 'Planifie la reprise progressive des volumes, valide les contrôles qualité en ligne.',
      role: 'Responsable Production',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // Responsable Maintenance
  'Responsable Maintenance': [
    {
      phase: 'Préparation',
      title: 'Préparation – Maintenance',
      description: 'Assure la maintenance préventive des équipements critiques, identifie les vulnérabilités techniques.',
      role: 'Responsable Maintenance',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Maintenance',
      description: 'Intervient sur les défaillances techniques, sécurise les installations affectées, isole les équipements à risque.',
      role: 'Responsable Maintenance',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Maintenance',
      description: 'Réalise les diagnostics techniques post-incident, assure les réparations et met à jour les plans de maintenance.',
      role: 'Responsable Maintenance',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // DL (Directeur Logistique)
  'DL (Directeur Logistique)': [
    {
      phase: 'Préparation',
      title: 'Préparation – Logistique',
      description: 'Pilote les stocks stratégiques, valide les plans de continuité logistique.',
      role: 'DL (Directeur Logistique)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Logistique',
      description: 'Coordonne les flux internes et externes en crise, organise les acheminements d\'urgence.',
      role: 'DL (Directeur Logistique)',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Logistique',
      description: 'Réorganise les tournées, adapte les moyens logistiques à la reprise des activités.',
      role: 'DL (Directeur Logistique)',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // RMQ (Responsable Management Qualité)
  'RMQ (Responsable Management Qualité)': [
    {
      phase: 'Préparation',
      title: 'Préparation – Management Qualité',
      description: 'Met à jour le système qualité global, coordonne les exercices internes.',
      role: 'RMQ (Responsable Management Qualité)',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Management Qualité',
      description: 'Centralise les données qualité, gère les déviations, communique avec les parties prenantes internes.',
      role: 'RMQ (Responsable Management Qualité)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Management Qualité',
      description: 'Coordonne l\'analyse des écarts et les actions correctives, ajuste le SMQ.',
      role: 'RMQ (Responsable Management Qualité)',
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  ],
  
  // DT (Directeur Technique)
  'DT (Directeur Technique)': [
    {
      phase: 'Préparation',
      title: 'Préparation – Technique',
      description: 'Pilote les plans d\'amélioration technique liés à la sécurité et la continuité.',
      role: 'DT (Directeur Technique)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Technique',
      description: 'Supervise les interventions techniques critiques, appuie les équipes opérationnelles.',
      role: 'DT (Directeur Technique)',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Technique',
      description: 'Évalue l\'état technique général post-incident, propose des axes de renforcement.',
      role: 'DT (Directeur Technique)',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // R PF (Responsable Produits Finis)
  'R PF (Responsable Produits Finis)': [
    {
      phase: 'Préparation',
      title: 'Préparation – Produits Finis',
      description: 'Met en place des protocoles de contrôle renforcé des produits finis.',
      role: 'R PF (Responsable Produits Finis)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Produits Finis',
      description: 'Gère les quarantaines de produits finis, assure la traçabilité et le blocage des lots.',
      role: 'R PF (Responsable Produits Finis)',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Produits Finis',
      description: 'Valide les produits remis sur le marché, gère les actions de retrait/rappel si nécessaire.',
      role: 'R PF (Responsable Produits Finis)',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // D Supply (Directeur Supply Chain)
  'D Supply (Directeur Supply Chain)': [
    {
      phase: 'Préparation',
      title: 'Préparation – Supply Chain',
      description: 'Assure la sécurisation des flux stratégiques (MP, emballages), diversifie les fournisseurs critiques.',
      role: 'D Supply (Directeur Supply Chain)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Supply Chain',
      description: 'Pilote la logistique de crise, priorise les flux selon l\'impact, adapte les schémas d\'approvisionnement.',
      role: 'D Supply (Directeur Supply Chain)',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Supply Chain',
      description: 'Réévalue les fournisseurs, relance les chaînes d\'approvisionnement, ajuste les plannings fournisseurs.',
      role: 'D Supply (Directeur Supply Chain)',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ],
  
  // DAL (Directeur Affaires Légales)
  'DAL (Directeur Affaires Légales)': [
    {
      phase: 'Préparation',
      title: 'Préparation – Affaires Légales',
      description: 'Participe à l\'évaluation des risques juridiques, revoit les clauses contractuelles critiques.',
      role: 'DAL (Directeur Affaires Légales)',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Affaires Légales',
      description: 'Conseille la cellule de crise sur les obligations légales, assure la conformité des communications officielles.',
      role: 'DAL (Directeur Affaires Légales)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Affaires Légales',
      description: 'Pilote la gestion des réclamations, met à jour les dispositifs juridiques selon le retour d\'expérience.',
      role: 'DAL (Directeur Affaires Légales)',
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  ],
  
  // R SANTÉ (Responsable Santé)
  'R SANTÉ (Responsable Santé)': [
    {
      phase: 'Préparation',
      title: 'Préparation – Santé',
      description: 'Met à jour les protocoles de santé au travail, supervise la formation premiers secours.',
      role: 'R SANTÉ (Responsable Santé)',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Santé',
      description: 'Coordonne les soins immédiats, suit les impacts sanitaires directs ou psychologiques.',
      role: 'R SANTÉ (Responsable Santé)',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Santé',
      description: 'Suit les dossiers de santé post-incident, ajuste les protocoles médicaux internes.',
      role: 'R SANTÉ (Responsable Santé)',
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  ],
  
  // Médecin du travail
  'Médecin du travail': [
    {
      phase: 'Préparation',
      title: 'Préparation – Médecine du travail',
      description: 'Participe aux plans de prévention, évalue les risques professionnels en situation de crise.',
      role: 'Médecin du travail',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Médecine du travail',
      description: 'Intervient en soutien médical immédiat, évalue les risques spécifiques (chimiques, thermiques, biologiques).',
      role: 'Médecin du travail',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Médecine du travail',
      description: 'Assure le suivi médical post-incident, identifie les besoins de soutien psychologique prolongé.',
      role: 'Médecin du travail',
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  ],
  
  // Astreinte
  'Astreinte': [
    {
      phase: 'Préparation',
      title: 'Préparation – Astreinte',
      description: 'S\'assure de son rôle durant une urgence, de la disponibilité des EID, de l\'emplacement des moyens de réponse (équipements, matériel spécifique), maîtrise la communication interne et la gestion des ressources d\'intervention.',
      role: 'Astreinte',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      phase: 'Réponse',
      title: 'Réponse – Astreinte',
      description: 'Déclenche la réponse à l\'urgence, coordonne les actions d\'urgence, mobilise les ressources nécessaires, communique avec les parties prenantes, évalue la gravité de la situation et prend les décisions opérationnelles pour contenir l\'incident jusqu\'à prise en charge par la cellule de gestion de crise locale.',
      role: 'Astreinte',
      status: 'PENDING',
      priority: 'URGENT'
    },
    {
      phase: 'Reprise',
      title: 'Reprise – Astreinte',
      description: 'Supervise le retour à la normale, participe à l\'analyse post-incident (retour d\'expérience), identifie les points d\'amélioration, et participe à l\'actualisation des procédures en conséquence.',
      role: 'Astreinte',
      status: 'PENDING',
      priority: 'HIGH'
    }
  ]
};

export const ROLES = Object.keys(ALL_TASKS);

export function getTasksByRole(role: string): TaskDefinition[] {
  return ALL_TASKS[role] || [];
}

export function getAllTasks(): TaskDefinition[] {
  return Object.values(ALL_TASKS).flat();
}

export function getTasksByPhase(phase: 'Préparation' | 'Réponse' | 'Reprise'): TaskDefinition[] {
  return getAllTasks().filter(task => task.phase === phase);
}
