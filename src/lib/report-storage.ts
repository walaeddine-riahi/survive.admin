// Service pour la gestion du stockage des rapports BIA
// Dans une vraie application, ceci pourrait utiliser une base de données ou un service cloud

export interface SavedReport {
  id: string;
  name: string;
  format: "pdf" | "docx" | "json";
  generatedAt: Date;
  size: number;
  metadata: {
    totalProcesses: number;
    continuityLevel: string;
    riskCount: number;
    recommendationCount: number;
  };
  content?: string; // Pour les rapports JSON
  filePath?: string; // Pour les rapports PDF/Word
}

export class BiaReportStorage {
  private static reports: SavedReport[] = [];

  // Sauvegarder un rapport
  static async saveReport(
    report: Omit<SavedReport, "id" | "generatedAt">
  ): Promise<SavedReport> {
    const savedReport: SavedReport = {
      ...report,
      id: this.generateId(),
      generatedAt: new Date(),
    };

    this.reports.push(savedReport);
    return savedReport;
  }

  // Récupérer tous les rapports sauvegardés
  static async getSavedReports(): Promise<SavedReport[]> {
    return this.reports.sort(
      (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()
    );
  }

  // Récupérer un rapport par ID
  static async getReportById(id: string): Promise<SavedReport | null> {
    return this.reports.find((report) => report.id === id) || null;
  }

  // Supprimer un rapport
  static async deleteReport(id: string): Promise<boolean> {
    const index = this.reports.findIndex((report) => report.id === id);
    if (index !== -1) {
      this.reports.splice(index, 1);
      return true;
    }
    return false;
  }

  // Rechercher des rapports par critères
  static async searchReports(criteria: {
    format?: "pdf" | "docx" | "json";
    dateFrom?: Date;
    dateTo?: Date;
    minProcesses?: number;
  }): Promise<SavedReport[]> {
    return this.reports.filter((report) => {
      if (criteria.format && report.format !== criteria.format) return false;
      if (criteria.dateFrom && report.generatedAt < criteria.dateFrom)
        return false;
      if (criteria.dateTo && report.generatedAt > criteria.dateTo) return false;
      if (
        criteria.minProcesses &&
        report.metadata.totalProcesses < criteria.minProcesses
      )
        return false;
      return true;
    });
  }

  // Obtenir des statistiques sur les rapports
  static async getStorageStats(): Promise<{
    totalReports: number;
    totalSize: number;
    formatBreakdown: { pdf: number; docx: number; json: number };
    averageProcesses: number;
  }> {
    const totalReports = this.reports.length;
    const totalSize = this.reports.reduce(
      (sum, report) => sum + report.size,
      0
    );

    const formatBreakdown = {
      pdf: this.reports.filter((r) => r.format === "pdf").length,
      docx: this.reports.filter((r) => r.format === "docx").length,
      json: this.reports.filter((r) => r.format === "json").length,
    };

    const averageProcesses =
      totalReports > 0
        ? this.reports.reduce(
            (sum, report) => sum + report.metadata.totalProcesses,
            0
          ) / totalReports
        : 0;

    return {
      totalReports,
      totalSize,
      formatBreakdown,
      averageProcesses: Math.round(averageProcesses),
    };
  }

  // Nettoyer les anciens rapports (plus de 30 jours)
  static async cleanupOldReports(maxAgeInDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

    const initialCount = this.reports.length;
    this.reports = this.reports.filter(
      (report) => report.generatedAt >= cutoffDate
    );

    return initialCount - this.reports.length; // Nombre de rapports supprimés
  }

  // Générer un ID unique pour un rapport
  private static generateId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculer la taille d'un rapport JSON
  static calculateJsonSize(data: unknown): number {
    return JSON.stringify(data).length;
  }

  // Formater la taille en unités lisibles
  static formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  // Valider un rapport avant sauvegarde
  static validateReport(report: Omit<SavedReport, "id" | "generatedAt">): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!report.name || report.name.trim().length === 0) {
      errors.push("Le nom du rapport est requis");
    }

    if (!["pdf", "docx", "json"].includes(report.format)) {
      errors.push("Format de rapport invalide");
    }

    if (report.size <= 0) {
      errors.push("La taille du rapport doit être positive");
    }

    if (!report.metadata.totalProcesses || report.metadata.totalProcesses < 0) {
      errors.push("Le nombre de processus doit être positif");
    }

    if (report.format === "json" && !report.content) {
      errors.push("Le contenu JSON est requis pour les rapports JSON");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Exporter les métadonnées de tous les rapports
  static async exportMetadata(): Promise<string> {
    const metadata = this.reports.map((report) => ({
      id: report.id,
      name: report.name,
      format: report.format,
      generatedAt: report.generatedAt,
      size: report.size,
      metadata: report.metadata,
    }));

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalReports: this.reports.length,
        reports: metadata,
      },
      null,
      2
    );
  }
}
