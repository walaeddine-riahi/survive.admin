import { getPredefinedResponse } from "./ai-config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DashboardStats {
  activeIncidents: number;
  identifiedRisks: number;
  preventiveMeasures: number;
  incidentResolutionRate: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface WebSearchResult {
  title: string;
  snippet: string;
  link: string;
}

interface DuckDuckGoResponse {
  Abstract: string;
  AbstractURL: string;
  Heading: string;
  RelatedTopics: Array<{
    Text: string;
    FirstURL: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class AIService {
  private static instance: AIService;
  private conversationHistory: Message[] = [];
  private readonly maxHistoryLength = 10;
  private readonly GEMINI_API_KEY = "AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4";
  private readonly GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return await response.json();
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        activeIncidents: 0,
        identifiedRisks: 0,
        preventiveMeasures: 0,
        incidentResolutionRate: 0,
      };
    }
  }

  private async fetchTeamMembers(): Promise<TeamMember[]> {
    try {
      const response = await fetch("/api/team/members");
      if (!response.ok) throw new Error("Failed to fetch team members");
      return await response.json();
    } catch (error) {
      console.error("Error fetching team members:", error);
      return [];
    }
  }

  private async fetchActiveIncidents(): Promise<Incident[]> {
    try {
      const response = await fetch("/api/incidents/active");
      if (!response.ok) throw new Error("Failed to fetch active incidents");
      return await response.json();
    } catch (error) {
      console.error("Error fetching active incidents:", error);
      return [];
    }
  }

  private async searchWeb(query: string): Promise<WebSearchResult[]> {
    try {
      // Amélioration de la requête pour les normes et standards
      const searchQuery = query.includes("iso")
        ? `${query} standard certification requirements framework`
        : query;

      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(
          searchQuery
        )}&format=json&kl=wt-wt`
      );
      if (!response.ok) throw new Error("Failed to fetch web search results");

      const data = (await response.json()) as DuckDuckGoResponse;

      // Formater les résultats
      const results: WebSearchResult[] = [];

      // Ajouter le résultat principal s'il existe
      if (data.Abstract) {
        results.push({
          title: data.Heading || "Résultat principal",
          snippet: data.Abstract,
          link: data.AbstractURL || "",
        });
      }

      // Ajouter les résultats connexes avec une meilleure pertinence
      if (data.RelatedTopics) {
        data.RelatedTopics.filter(
          (topic) =>
            topic.Text && topic.Text.toLowerCase().includes(query.toLowerCase())
        ).forEach((topic) => {
          if (topic.Text) {
            results.push({
              title: topic.Text.split(" - ")[0] || "Résultat connexe",
              snippet: topic.Text,
              link: topic.FirstURL || "",
            });
          }
        });
      }

      // Si aucun résultat pertinent n'est trouvé, essayer une recherche alternative
      if (results.length === 0) {
        const alternativeResponse = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(
            query + " definition overview guide"
          )}&format=json&kl=wt-wt`
        );
        if (alternativeResponse.ok) {
          const altData =
            (await alternativeResponse.json()) as DuckDuckGoResponse;
          if (altData.Abstract) {
            results.push({
              title: altData.Heading || "Information générale",
              snippet: altData.Abstract,
              link: altData.AbstractURL || "",
            });
          }
        }
      }

      return results.slice(0, 3); // Retourner les 3 premiers résultats
    } catch (error) {
      console.error("Error performing web search:", error);
      return [];
    }
  }

  private formatWebSearchResponse(results: WebSearchResult[]): string {
    if (results.length === 0) {
      return "Je n'ai pas trouvé d'informations pertinentes sur le web pour votre question. Pouvez-vous reformuler ou préciser votre demande ?";
    }

    let response = "Voici ce que j'ai trouvé sur le web :\n\n";

    results.forEach((result, index) => {
      response += `${index + 1}. ${result.title}\n`;
      response += `${result.snippet}\n`;
      if (result.link) {
        response += `Source: ${result.link}\n`;
      }
      response += "\n";
    });

    response +=
      "Ces informations sont basées sur des sources web. Pour des informations spécifiques à notre plateforme, n'hésitez pas à me poser des questions sur nos fonctionnalités.";

    return response;
  }

  private formatStatsResponse(stats: DashboardStats): string {
    return (
      `Les dernières statistiques de gestion des risques sont disponibles dans le tableau de bord. Voici un aperçu des indicateurs clés :\n\n` +
      `• Nombre d'incidents actifs : ${stats.activeIncidents}\n` +
      `• Risques identifiés ce mois : ${stats.identifiedRisks}\n` +
      `• Mesures préventives mises en place : ${stats.preventiveMeasures}\n` +
      `• Taux de résolution des incidents : ${stats.incidentResolutionRate}%\n\n` +
      `Pour plus de détails, consultez le tableau de bord complet dans la section 'Statistiques'.`
    );
  }

  private formatTeamResponse(members: TeamMember[]): string {
    if (members.length === 0) {
      return "Je ne peux pas récupérer les informations de l'équipe pour le moment. Veuillez réessayer plus tard.";
    }

    const departments = [...new Set(members.map((m) => m.department))];
    return (
      `Pour accéder à la section des membres de l'équipe :\n\n` +
      `1. Cliquez sur 'Team Members' dans le menu de navigation\n` +
      `2. Vous verrez la liste complète des ${members.length} membres\n` +
      `3. Vous pouvez filtrer par département (${departments.join(", ")})\n` +
      `4. Chaque profil contient les informations de contact et les responsabilités\n\n` +
      `Besoin d'aide pour trouver un membre spécifique ?`
    );
  }

  private formatIncidentsResponse(incidents: Incident[]): string {
    if (incidents.length === 0) {
      return "Aucun incident actif pour le moment.";
    }

    return (
      `La gestion des incidents se fait dans la section 'Incidents'. Voici les incidents actifs :\n\n` +
      incidents
        .map((inc) => `• ${inc.title} (${inc.priority} - ${inc.status})`)
        .join("\n") +
      "\n\n" +
      `Vous pouvez :\n` +
      `• Déclarer un nouvel incident\n` +
      `• Suivre l'état des incidents en cours\n` +
      `• Consulter l'historique des incidents\n` +
      `• Générer des rapports d'incidents\n\n` +
      `Voulez-vous que je vous guide pour l'une de ces actions ?`
    );
  }

  private async queryGemini(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = (await response.json()) as GeminiResponse;

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response from Gemini API");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error querying Gemini:", error);
      throw error;
    }
  }

  public async getResponse(userMessage: string): Promise<string> {
    try {
      const lowerMessage = userMessage.toLowerCase();

      // Vérifier s'il y a une réponse prédéfinie
      const predefinedResponse = getPredefinedResponse(userMessage);
      if (predefinedResponse) {
        this.addToHistory({ role: "user", content: userMessage });
        this.addToHistory({ role: "assistant", content: predefinedResponse });
        return predefinedResponse;
      }

      // Réponses dynamiques basées sur le contenu du message
      if (
        lowerMessage.includes("statistiques") ||
        lowerMessage.includes("stats") ||
        lowerMessage.includes("risque management")
      ) {
        const stats = await this.fetchDashboardStats();
        const response = this.formatStatsResponse(stats);
        this.addToHistory({ role: "user", content: userMessage });
        this.addToHistory({ role: "assistant", content: response });
        return response;
      }

      if (
        lowerMessage.includes("team") ||
        lowerMessage.includes("équipe") ||
        lowerMessage.includes("membre")
      ) {
        const members = await this.fetchTeamMembers();
        const response = this.formatTeamResponse(members);
        this.addToHistory({ role: "user", content: userMessage });
        this.addToHistory({ role: "assistant", content: response });
        return response;
      }

      if (lowerMessage.includes("incident")) {
        const incidents = await this.fetchActiveIncidents();
        const response = this.formatIncidentsResponse(incidents);
        this.addToHistory({ role: "user", content: userMessage });
        this.addToHistory({ role: "assistant", content: response });
        return response;
      }

      // Utiliser Gemini pour les autres questions
      const context = this.conversationHistory
        .slice(-3)
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const prompt = `En tant qu'assistant spécialisé en gestion des risques et sécurité de l'information, 
      réponds à la question suivante de manière professionnelle et concise. 
      Si la question concerne des normes ou standards, fournis des informations précises et vérifiables.
      
      Contexte de la conversation:
      ${context}
      
      Question actuelle: ${userMessage}`;

      const response = await this.queryGemini(prompt);
      this.addToHistory({ role: "user", content: userMessage });
      this.addToHistory({ role: "assistant", content: response });
      return response;
    } catch (error) {
      console.error("Erreur lors du traitement de la réponse:", error);
      return "Je suis désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ou essayer une autre approche ?";
    }
  }

  private addToHistory(message: Message) {
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(
        -this.maxHistoryLength
      );
    }
  }

  public clearHistory() {
    this.conversationHistory = [];
  }
}
