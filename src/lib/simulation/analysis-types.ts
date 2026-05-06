
export interface CommunicationAnalysis {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  tonalityScore: number;
  stressLevel: "low" | "medium" | "high" | "critical";
  decisionQuality: number;
  clarityScore: number;
  relatedInjectId?: string;
  keyDecisions: string[];
  flags: string[];
  sentiment: "positive" | "neutral" | "negative" | "urgent";
}

export interface InjectAnalysis {
  injectionId: string;
  injectionTitle: string;
  injectionType: string;
  injectedAt: string;
  firstResponseAt?: string;
  reactionDelayMin?: number;
  resolutionTimeMin?: number;
  expectedAction?: string;
  expectedActor?: string;
  expectedDelayMin?: number;
  actualAction?: string;
  actualActor?: string;
  conformityScore: number;
  conformityStatus: "CONFORMANT" | "PARTIAL" | "NON_CONFORMANT" | "NOT_APPLICABLE";
  gaps: string[];
  reactionQuality: number;
  decisionQuality: number;
  communicationQuality: number;
  observations: string[];
  improvementPoints: string[];
}
