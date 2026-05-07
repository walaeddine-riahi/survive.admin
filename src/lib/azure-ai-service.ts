// Note: Using openai SDK instead of @azure/openai for compatibility
import OpenAI from "openai";
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

export class AIService {
  private static instance: AIService;
  private conversationHistory: Message[] = [];
  private readonly maxHistoryLength = 10;
  private openAIClient: OpenAI | null = null;
  private deploymentName: string;

  private constructor() {
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4";
    this.initializeAzureOpenAI();
  }

  private initializeAzureOpenAI() {
    let endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    let apiKey = process.env.AZURE_OPENAI_API_KEY;

    if (endpoint) endpoint = endpoint.replace(/^["']|["']$/g, "");
    if (apiKey) apiKey = apiKey.replace(/^["']|["']$/g, "");

    if (!endpoint || !apiKey) {
      console.warn(
        "⚠️ Azure OpenAI non configuré, utilisation du mode de secours"
      );
      return;
    }

    try {
      const cleanEndpoint = endpoint.replace(/\/$/, "");
      this.openAIClient = new OpenAI({
        apiKey: apiKey,
        baseURL: `${cleanEndpoint}/openai/deployments/${
          this.deploymentName
        }`,
        defaultQuery: {
          "api-version":
            process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
        },
        defaultHeaders: { "api-key": apiKey },
      });
      console.log("✅ Azure OpenAI initialisé");
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'initialisation d'Azure OpenAI:",
        error
      );
    }
  }

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
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(
          query
        )}&format=json&no_html=1`
      );
      const data = (await response.json()) as DuckDuckGoResponse;

      const results: WebSearchResult[] = [];
      if (data.Abstract) {
        results.push({
          title: data.Heading,
          snippet: data.Abstract,
          link: data.AbstractURL,
        });
      }

      data.RelatedTopics.forEach((topic) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.substring(0, 100),
            snippet: topic.Text,
            link: topic.FirstURL,
          });
        }
      });

      return results.slice(0, 5);
    } catch (error) {
      console.error("Error searching web:", error);
      return [];
    }
  }

  private async enrichContextWithData(
    message: string
  ): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {};

    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("statistiques") ||
      lowerMessage.includes("stats") ||
      lowerMessage.includes("dashboard")
    ) {
      context.stats = await this.fetchDashboardStats();
    }

    if (
      lowerMessage.includes("équipe") ||
      lowerMessage.includes("team") ||
      lowerMessage.includes("membres")
    ) {
      context.teamMembers = await this.fetchTeamMembers();
    }

    if (lowerMessage.includes("incident") || lowerMessage.includes("active")) {
      context.activeIncidents = await this.fetchActiveIncidents();
    }

    if (
      lowerMessage.includes("recherche") ||
      lowerMessage.includes("trouver")
    ) {
      const searchQuery = message.replace(/(recherche|trouver|chercher)/gi, "");
      context.webResults = await this.searchWeb(searchQuery);
    }

    return context;
  }

  private formatContextForPrompt(context: Record<string, unknown>): string {
    let contextStr = "";

    if (context.stats) {
      const stats = context.stats as DashboardStats;
      contextStr += `\n\nStatistiques actuelles:
- Incidents actifs: ${stats.activeIncidents}
- Risques identifiés: ${stats.identifiedRisks}
- Mesures préventives: ${stats.preventiveMeasures}
- Taux de résolution: ${stats.incidentResolutionRate}%`;
    }

    if (context.teamMembers && Array.isArray(context.teamMembers)) {
      contextStr += `\n\nÉquipe (${context.teamMembers.length} membres):`;
      context.teamMembers.slice(0, 5).forEach((member: TeamMember) => {
        contextStr += `\n- ${member.name} (${member.role})`;
      });
    }

    if (context.activeIncidents && Array.isArray(context.activeIncidents)) {
      contextStr += `\n\nIncidents actifs (${context.activeIncidents.length}):`;
      context.activeIncidents.slice(0, 3).forEach((incident: Incident) => {
        contextStr += `\n- ${incident.title} [${incident.status}]`;
      });
    }

    if (context.webResults && Array.isArray(context.webResults)) {
      contextStr += `\n\nRésultats de recherche:`;
      context.webResults.slice(0, 3).forEach((result: WebSearchResult) => {
        contextStr += `\n- ${result.title}: ${result.snippet.substring(
          0,
          100
        )}...`;
      });
    }

    return contextStr;
  }

  public async chat(userMessage: string): Promise<string> {
    // Vérifier les réponses prédéfinies
    const predefinedResponse = getPredefinedResponse(userMessage);
    if (predefinedResponse) {
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });
      this.conversationHistory.push({
        role: "assistant",
        content: predefinedResponse,
      });

      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(
          -this.maxHistoryLength
        );
      }

      return predefinedResponse;
    }

    // Enrichir le contexte avec des données
    const context = await this.enrichContextWithData(userMessage);
    const contextStr = this.formatContextForPrompt(context);

    // Construire le prompt avec le système et l'historique
    const systemPrompt = `Tu es un assistant virtuel spécialisé dans la gestion de la continuité d'activité et la simulation de crise pour la plateforme S.U.R.V.I.V.E. Resilience.

Notre devise : "When the going gets tough, the tough get going" - Nous aidons les organisations à se préparer et à surmonter les situations de crise.

Règles importantes :
- Reste professionnel et concis
- Utilise un langage clair et accessible
- Fais référence aux données contextuelles fournies
- Si tu ne connais pas la réponse, dis-le honnêtement${contextStr}`;

    // Construire les messages pour l'API
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    try {
      let assistantResponse: string;

      if (this.openAIClient) {
        // Utiliser Azure OpenAI
        const result = await this.openAIClient.chat.completions.create({
          model: this.deploymentName,
          messages,
          max_tokens: 500,
          temperature: 0.7,
        });

        assistantResponse =
          result.choices[0]?.message?.content ||
          "Désolé, je n'ai pas pu générer de réponse.";
      } else {
        // Mode de secours avec réponse générique
        assistantResponse =
          "Le service IA n'est pas configuré. Veuillez configurer Azure OpenAI dans vos variables d'environnement pour utiliser cette fonctionnalité.";
      }

      // Ajouter à l'historique
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });
      this.conversationHistory.push({
        role: "assistant",
        content: assistantResponse,
      });

      // Limiter la taille de l'historique
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(
          -this.maxHistoryLength
        );
      }

      return assistantResponse;
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse:", error);
      return "Désolé, une erreur est survenue lors du traitement de votre demande.";
    }
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }

  public getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  // Alias pour compatibilité avec le chatbot
  public async getResponse(userMessage: string): Promise<string> {
    return this.chat(userMessage);
  }
}

export const aiService = AIService.getInstance();
