import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

// Types pour les données du rapport
type ProcessStats = {
  total: number;
  byCriticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byDepartment: Record<string, number>;
  averageRTO: number;
  averageRPO: number;
  averageMTPD: number;
  processesNeedingAttention: number;
  globalContinuityLevel: {
    score: number;
    level: "Excellent" | "Bon" | "Moyen" | "Faible" | "Critique";
    color: string;
  };
  recommendations: string[];
  majorRisks: {
    type: string;
    description: string;
    severity: "Critique" | "Élevé" | "Moyen";
    processes: string[];
  }[];
};

type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export class BiaReportGenerator {
  // Génération du rapport PDF
  static async generatePdfReport(stats: ProcessStats): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    let yPosition = 20;

    // En-tête du rapport
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "Rapport d'Analyse d'Impact Métier (BIA)",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    yPosition += 20;

    // Section: Résumé Exécutif
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Résumé Exécutif", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const executiveSummary = [
      `Nombre total de processus analysés: ${stats.total}`,
      `Niveau de continuité global: ${stats.globalContinuityLevel.level} (${stats.globalContinuityLevel.score}/100)`,
      `Processus de haute criticité: ${
        stats.byCriticality.critical + stats.byCriticality.high
      }`,
      `RTO moyen: ${stats.averageRTO} heures`,
      `RPO moyen: ${stats.averageRPO} heures`,
      `Départements couverts: ${Object.keys(stats.byDepartment).length}`,
      `Processus nécessitant attention: ${stats.processesNeedingAttention}`,
    ];

    executiveSummary.forEach((item) => {
      pdf.text(`• ${item}`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Section: Répartition par Criticité
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Répartition par Criticité", 20, yPosition);
    yPosition += 10;

    const criticalityData = [
      ["Niveau de Criticité", "Nombre de Processus", "Pourcentage"],
      [
        "Critique",
        stats.byCriticality.critical.toString(),
        `${((stats.byCriticality.critical / stats.total) * 100).toFixed(1)}%`,
      ],
      [
        "Élevé",
        stats.byCriticality.high.toString(),
        `${((stats.byCriticality.high / stats.total) * 100).toFixed(1)}%`,
      ],
      [
        "Moyen",
        stats.byCriticality.medium.toString(),
        `${((stats.byCriticality.medium / stats.total) * 100).toFixed(1)}%`,
      ],
      [
        "Faible",
        stats.byCriticality.low.toString(),
        `${((stats.byCriticality.low / stats.total) * 100).toFixed(1)}%`,
      ],
    ];

    // @ts-expect-error - jsPDF autoTable types issue
    pdf.autoTable({
      head: [criticalityData[0]],
      body: criticalityData.slice(1),
      startY: yPosition,
      theme: "striped",
      headStyles: { fillColor: [66, 135, 245] },
    });

    // @ts-expect-error - lastAutoTable is added by autoTable plugin
    yPosition = pdf.lastAutoTable.finalY + 15;

    // Nouvelle page si nécessaire
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    // Section: Risques Majeurs
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Risques Majeurs Identifiés", 20, yPosition);
    yPosition += 10;

    if (stats.majorRisks.length > 0) {
      const riskData = [
        ["Type de Risque", "Sévérité", "Description", "Processus Concernés"],
      ];

      stats.majorRisks.forEach((risk) => {
        riskData.push([
          risk.type,
          risk.severity,
          risk.description.substring(0, 100) +
            (risk.description.length > 100 ? "..." : ""),
          risk.processes.length.toString(),
        ]);
      });

      // @ts-expect-error - jsPDF autoTable types issue
      pdf.autoTable({
        head: [riskData[0]],
        body: riskData.slice(1),
        startY: yPosition,
        theme: "striped",
        headStyles: { fillColor: [245, 101, 101] },
        columnStyles: {
          2: { cellWidth: 60 }, // Description column wider
        },
      });

      // @ts-expect-error - lastAutoTable is added by autoTable plugin
      yPosition = pdf.lastAutoTable.finalY + 15;
    } else {
      pdf.setFontSize(10);
      pdf.text("Aucun risque majeur identifié", 25, yPosition);
      yPosition += 15;
    }

    // Nouvelle page pour les recommandations
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    // Section: Recommandations
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Recommandations", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    stats.recommendations.forEach((recommendation, index) => {
      const lines = pdf.splitTextToSize(
        `${index + 1}. ${recommendation}`,
        pageWidth - 40
      );

      if (yPosition + lines.length * 6 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(lines, 25, yPosition);
      yPosition += lines.length * 6 + 3;
    });

    // Sauvegarde du PDF
    pdf.save(`Rapport_BIA_${new Date().toISOString().split("T")[0]}.pdf`);
  }

  // Génération du rapport Word
  static async generateWordReport(stats: ProcessStats): Promise<void> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Titre principal
            new Paragraph({
              children: [
                new TextRun({
                  text: "Rapport d'Analyse d'Impact Métier (BIA)",
                  bold: true,
                  size: 32,
                  color: "2E5984",
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),

            // Date de génération
            new Paragraph({
              children: [
                new TextRun({
                  text: `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
                  italics: true,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Section Résumé Exécutif
            new Paragraph({
              children: [
                new TextRun({
                  text: "Résumé Exécutif",
                  bold: true,
                  size: 24,
                  color: "2E5984",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),

            // Métriques principales
            new Paragraph({
              children: [
                new TextRun({
                  text: "Situation Actuelle :",
                  bold: true,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),

            ...this.createBulletPoints([
              `${stats.total} processus analysés au total`,
              `Niveau de continuité global : ${stats.globalContinuityLevel.level} (${stats.globalContinuityLevel.score}/100)`,
              `${
                stats.byCriticality.critical + stats.byCriticality.high
              } processus de haute criticité`,
              `RTO moyen de ${stats.averageRTO} heures`,
              `RPO moyen de ${stats.averageRPO} heures`,
              `${Object.keys(stats.byDepartment).length} départements couverts`,
              `${stats.processesNeedingAttention} processus nécessitent une attention immédiate`,
            ]),

            // Table de répartition par criticité
            new Paragraph({
              children: [
                new TextRun({
                  text: "Répartition par Criticité",
                  bold: true,
                  size: 24,
                  color: "2E5984",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),

            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Niveau de Criticité",
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Nombre de Processus",
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Pourcentage", bold: true }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: "Critique" })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: stats.byCriticality.critical.toString(),
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${(
                                (stats.byCriticality.critical / stats.total) *
                                100
                              ).toFixed(1)}%`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: "Élevé" })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: stats.byCriticality.high.toString(),
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${(
                                (stats.byCriticality.high / stats.total) *
                                100
                              ).toFixed(1)}%`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: "Moyen" })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: stats.byCriticality.medium.toString(),
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${(
                                (stats.byCriticality.medium / stats.total) *
                                100
                              ).toFixed(1)}%`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: "Faible" })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: stats.byCriticality.low.toString(),
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${(
                                (stats.byCriticality.low / stats.total) *
                                100
                              ).toFixed(1)}%`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Section Risques Majeurs
            new Paragraph({
              children: [
                new TextRun({
                  text: "Risques Majeurs Identifiés",
                  bold: true,
                  size: 24,
                  color: "D32F2F",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),

            ...(stats.majorRisks.length > 0
              ? stats.majorRisks.flatMap((risk) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${risk.type} (${risk.severity})`,
                        bold: true,
                        color:
                          risk.severity === "Critique"
                            ? "D32F2F"
                            : risk.severity === "Élevé"
                            ? "FF9800"
                            : "FBC02D",
                      }),
                    ],
                    spacing: { before: 200, after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: risk.description,
                      }),
                    ],
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Processus concernés: ${risk.processes.join(
                          ", "
                        )}`,
                        italics: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ])
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Aucun risque majeur identifié",
                        color: "4CAF50",
                      }),
                    ],
                  }),
                ]),

            // Section Recommandations
            new Paragraph({
              children: [
                new TextRun({
                  text: "Recommandations",
                  bold: true,
                  size: 24,
                  color: "1976D2",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),

            ...stats.recommendations.map(
              (recommendation, index) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. ${recommendation}`,
                    }),
                  ],
                  spacing: { after: 100 },
                })
            ),
          ],
        },
      ],
    });

    // Génération et sauvegarde du document Word
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Rapport_BIA_${new Date().toISOString().split("T")[0]}.docx`);
  }

  // Méthode utilitaire pour créer des listes à puces
  private static createBulletPoints(items: string[]): Paragraph[] {
    return items.map(
      (item) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${item}`,
            }),
          ],
          spacing: { after: 100 },
        })
    );
  }

  // Génération de rapport JSON pour stockage
  static generateJsonReport(stats: ProcessStats, processes: Process[]): string {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        type: "BIA_REPORT",
      },
      summary: {
        totalProcesses: stats.total,
        globalContinuityLevel: stats.globalContinuityLevel,
        averageMetrics: {
          rto: stats.averageRTO,
          rpo: stats.averageRPO,
          mtpd: stats.averageMTPD,
        },
        criticality: stats.byCriticality,
        departments: stats.byDepartment,
        processesNeedingAttention: stats.processesNeedingAttention,
      },
      risks: stats.majorRisks,
      recommendations: stats.recommendations,
      processes: processes.map((p) => ({
        id: p.id,
        name: p.name,
        department: p.department,
        location: p.location,
        criticality: p.criticality,
        rto: p.rto,
        rpo: p.rpo,
        mtpd: p.mtpd,
        mbco: p.mbco,
      })),
    };

    return JSON.stringify(report, null, 2);
  }

  // Sauvegarde du rapport JSON
  static saveJsonReport(stats: ProcessStats, processes: Process[]): void {
    const jsonReport = this.generateJsonReport(stats, processes);
    const blob = new Blob([jsonReport], { type: "application/json" });
    saveAs(blob, `Rapport_BIA_${new Date().toISOString().split("T")[0]}.json`);
  }
}
