export const AI_CONFIG = {
  // Utilisation du modèle Mistral 7B qui est plus performant pour la conversation
  model: "mistralai/Mistral-7B-Instruct-v0.1",
  apiUrl:
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
  // Le contexte système qui définit le comportement de l'assistant
  systemPrompt: `Tu es un assistant virtuel spécialisé dans la gestion de la continuité d'activité et la simulation de crise pour la plateforme S.U.R.V.I.V.E. Resilience (Sustainability, Unity, Resilience, Vision, Innovation, Versatility, and Efficiency).

Notre devise : "When the going gets tough, the tough get going" - Nous aidons les organisations à se préparer et à surmonter les situations de crise.

Tu dois :
1. Aider les utilisateurs à naviguer dans la plateforme
2. Répondre aux questions sur la gestion des risques
3. Expliquer les concepts de continuité d'activité
4. Guider les utilisateurs dans la gestion des incidents
5. Fournir des informations sur les meilleures pratiques

Règles importantes :
- Reste professionnel et concis
- Utilise un langage clair et accessible
- Fais référence aux fonctionnalités spécifiques de la plateforme
- Si tu ne connais pas la réponse, dis-le honnêtement
- Guide l'utilisateur vers les sections appropriées de l'application

Format de réponse :
- Commence toujours par "Assistant : "
- Sois direct et précis dans tes réponses
- Utilise des listes à puces quand c'est pertinent
- Inclus des liens vers les sections pertinentes quand c'est possible

Réponses prédéfinies pour les questions courantes :
- Pour les statistiques : "Les dernières statistiques de gestion des risques sont disponibles dans le tableau de bord. Vous y trouverez des indicateurs clés sur les incidents, les risques identifiés, et les mesures préventives mises en place."
- Pour la navigation : "Pour accéder à une section spécifique, utilisez le menu de navigation à gauche. Je peux vous guider vers la section que vous recherchez."
- Pour les incidents : "La gestion des incidents se fait dans la section 'Incidents'. Vous pouvez y déclarer de nouveaux incidents et suivre leur résolution."
- Pour la continuité : "La continuité d'activité est gérée dans la section 'Continuité'. Vous y trouverez les plans de continuité et les procédures de reprise d'activité."`,
};

// Fonction pour formater le contexte de la conversation
export function formatConversationContext(
  messages: { role: string; content: string }[]
) {
  const formattedMessages = messages.map((msg) => {
    if (msg.role === "assistant") {
      return `Assistant: ${msg.content}`;
    }
    return `Utilisateur: ${msg.content}`;
  });

  return `${AI_CONFIG.systemPrompt}\n\n${formattedMessages.join("\n\n")}`;
}

// Fonction pour obtenir une réponse prédéfinie basée sur les mots-clés
export function getPredefinedResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("statistiques") ||
    lowerMessage.includes("stats") ||
    lowerMessage.includes("risque management")
  ) {
    return (
      "Les dernières statistiques de gestion des risques sont disponibles dans le tableau de bord. Voici un aperçu des indicateurs clés :\n\n" +
      "• Nombre d'incidents actifs : 12\n" +
      "• Risques identifiés ce mois : 45\n" +
      "• Mesures préventives mises en place : 28\n" +
      "• Taux de résolution des incidents : 85%\n\n" +
      "Pour plus de détails, consultez le tableau de bord complet dans la section 'Statistiques'."
    );
  }

  if (
    lowerMessage.includes("naviguer") ||
    lowerMessage.includes("aller") ||
    lowerMessage.includes("page")
  ) {
    return (
      "Pour naviguer dans l'application, utilisez le menu de navigation à gauche. Voici les principales sections :\n\n" +
      "• Tableau de bord : Vue d'ensemble et statistiques\n" +
      "• Incidents : Gestion et suivi des incidents\n" +
      "• Team Members : Gestion de l'équipe\n" +
      "• Continuité : Plans et procédures\n\n" +
      "Je peux vous guider vers la section qui vous intéresse."
    );
  }

  if (
    lowerMessage.includes("team") ||
    lowerMessage.includes("équipe") ||
    lowerMessage.includes("membre")
  ) {
    return (
      "Pour accéder à la section des membres de l'équipe :\n\n" +
      "1. Cliquez sur 'Team Members' dans le menu de navigation\n" +
      "2. Vous verrez la liste complète des membres\n" +
      "3. Vous pouvez filtrer par département ou rôle\n" +
      "4. Chaque profil contient les informations de contact et les responsabilités\n\n" +
      "Besoin d'aide pour trouver un membre spécifique ?"
    );
  }

  if (lowerMessage.includes("incident")) {
    return (
      "La gestion des incidents se fait dans la section 'Incidents'. Voici ce que vous pouvez faire :\n\n" +
      "• Déclarer un nouvel incident\n" +
      "• Suivre l'état des incidents en cours\n" +
      "• Consulter l'historique des incidents\n" +
      "• Générer des rapports d'incidents\n\n" +
      "Voulez-vous que je vous guide pour l'une de ces actions ?"
    );
  }

  if (
    lowerMessage.includes("continuité") ||
    lowerMessage.includes("résilience")
  ) {
    return (
      "La continuité d'activité est gérée dans la section 'Continuité'. Vous y trouverez :\n\n" +
      "• Les plans de continuité d'activité (PCA)\n" +
      "• Les procédures de reprise d'activité (PRA)\n" +
      "• Les scénarios de test et exercices\n" +
      "• Les rapports d'audit et de conformité\n\n" +
      "Quel aspect de la continuité d'activité vous intéresse ?"
    );
  }

  return null;
}
