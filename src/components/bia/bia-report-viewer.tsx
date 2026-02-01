"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  AlertTriangle,
  Shield,
  Clock,
  ArrowLeft,
  Printer,
  FileText,
  CheckCircle2,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BiaReportViewerProps {
  report: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    createdAt: Date;
    reportData: unknown;
    factory?: {
      id: string;
      name: string;
      code: string;
      address?: string | null;
      city?: string | null;
      country?: string | null;
    } | null;
    author?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string;
    } | null;
  };
}

interface ActivityData {
  name: string;
  role: string;
  impact: string;
  rto: number;
  rpo: number;
  mbco: string;
  workaround: string;
}

interface ProcessData {
  name: string;
  criticality: string;
  rto: number;
  rpo: number;
  mtpd: number;
  department?: string;
  owner?: {
    name: string;
    role: string;
  };
  activities?: ActivityData[];
}

interface RiskData {
  type: string;
  description: string;
  severity: string;
}

interface SummaryData {
  totalProcesses?: number;
  globalContinuityLevel?: {
    score?: number;
    level?: string;
  };
}

interface ReportDataStructure {
  metadata?: Record<string, unknown> & {
    factory?: {
      name?: string;
      code?: string;
      city?: string;
      country?: string;
      manager?: string;
      contact?: string;
    };
    reference?: string;
    version?: string;
    classification?: string;
  };
  summary?: SummaryData;
  risks?: RiskData[];
  recommendations?: string[];
  processes?: ProcessData[];
}

export function BiaReportViewer({ report }: BiaReportViewerProps) {
  const reportData = (report.reportData as ReportDataStructure) || {};
  const metadata = reportData.metadata || {};
  const summary = reportData.summary || {};
  const risks = reportData.risks || [];
  const recommendations = reportData.recommendations || [];

  // S'assurer que les processus sont bien des objets valides
  const processes = (reportData.processes || []).map((process) => ({
    ...process,
    activities: Array.isArray(process.activities)
      ? process.activities.filter(
          (activity) =>
            activity &&
            typeof activity === "object" &&
            typeof activity.name === "string" &&
            typeof activity.role === "string"
        )
      : [],
  }));

  // Composant d'en-tête réutilisable
  const PageHeader = ({ pageNumber }: { pageNumber: number | string }) => (
    <div className="border-2 border-black mb-8">
      <div className="flex items-stretch">
        <div
          className="border-r-2 border-black p-4 flex items-center justify-center"
          style={{ width: "120px" }}
        >
          <div className="text-center">
            <div
              className="font-bold text-2xl text-blue-600"
              style={{ fontFamily: "Arial" }}
            >
              SURVIVE
            </div>
            <div className="text-xs">BCM Platform</div>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center border-r-2 border-black">
          <div className="text-center">
            <div className="font-bold text-sm">
              Rapport d&apos;analyse d&apos;impact - BIA - Processus{" "}
              {report.factory?.name || "Organisation"}
            </div>
          </div>
        </div>
        <div className="p-2" style={{ width: "100px" }}>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="border border-black px-1 py-0.5 font-semibold bg-gray-100">
                  Réf.
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5">&nbsp;</td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5 font-semibold bg-gray-100">
                  Date
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5 font-semibold bg-gray-100">
                  Page {pageNumber}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // Afficher un message de chargement
      const downloadingMessage = document.createElement("div");
      downloadingMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 40px;
        border: 2px solid #1e40af;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
        font-family: Arial, sans-serif;
      `;
      downloadingMessage.innerHTML = `
        <div style="font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 15px;">
          📄 Génération du PDF en cours...
        </div>
        <div style="font-size: 14px; color: #666;">
          Veuillez patienter quelques instants
        </div>
        <div style="margin-top: 15px;">
          <div style="width: 200px; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: #1e40af; animation: loading 1.5s infinite;"></div>
          </div>
        </div>
        <style>
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        </style>
      `;
      document.body.appendChild(downloadingMessage);

      // Appeler l'API de génération PDF
      const response = await fetch(`/api/bia/generate-pdf/${report.id}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Récupérer le PDF
      const blob = await response.blob();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Nom du fichier depuis les headers ou par défaut
      const contentDisposition = response.headers.get("Content-Disposition");
      const fileNameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
      const fileName = fileNameMatch
        ? fileNameMatch[1]
        : `BIA_Rapport_${
            report.factory?.name?.replace(/[^a-z0-9]/gi, "_") || "Organisation"
          }_${format(new Date(report.createdAt), "yyyy-MM-dd")}.pdf`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      document.body.removeChild(downloadingMessage);

      // Message de succès
      const successMessage = document.createElement("div");
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
      `;
      successMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">✓</span>
          <span><strong>PDF téléchargé avec succès !</strong></span>
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        successMessage.style.animation = "slideIn 0.3s ease-out reverse";
        setTimeout(() => document.body.removeChild(successMessage), 300);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);

      // Retirer le message de chargement si présent
      const loadingMsg = document.querySelector('[style*="Génération du PDF"]');
      if (loadingMsg) {
        document.body.removeChild(loadingMsg);
      }

      alert(
        "❌ Erreur lors de la génération du PDF\n\n" +
          "Le serveur n'a pas pu générer le document.\n" +
          "Détails: " +
          (error instanceof Error ? error.message : "Erreur inconnue") +
          "\n\n" +
          "Veuillez réessayer ou contacter le support technique."
      );
    }
  };

  // Terminologie standard
  const terminology = [
    {
      term: "RTO",
      definition:
        "Recovery Time Objective - Délai maximal tolérable pour rétablir un processus après un incident",
    },
    {
      term: "MTPD",
      definition:
        "Maximum Tolerable Period of Disruption - Durée maximale acceptable d'interruption",
    },
    {
      term: "MBCO",
      definition:
        "Minimum Business Continuity Objective - Niveau minimal d'activité pour assurer la continuité",
    },
    {
      term: "RPO",
      definition:
        "Recovery Point Objective - Perte de données maximale acceptable",
    },
  ];

  // Grille d'analyse des impacts ISO 22317
  const impactCategories = [
    {
      category: "Financier",
      description: "Pertes directes, indirectes, amendes",
    },
    {
      category: "Réglementaire",
      description: "Non-conformité, sanctions légales",
    },
    {
      category: "Réputation",
      description: "Image de marque, confiance clients",
    },
    {
      category: "Opérationnel",
      description: "Capacité de production, livraisons",
    },
    { category: "Santé / Sécurité", description: "Risques pour le personnel" },
    { category: "Données", description: "Perte ou corruption d'informations" },
    { category: "Contractuel", description: "Rupture d'engagements" },
    { category: "Environnemental", description: "Impact écologique" },
    { category: "Social", description: "Impact sur les employés, communauté" },
  ];

  return (
    <div className="w-full bg-gray-50">
      {/* Header fixe pour les actions */}
      <div className="bg-white border-b print:hidden sticky top-0 z-10 shadow-sm">
        <div className="max-w-[210mm] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/bia/reports/${report.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Document principal - Format A4 */}
      <div className="max-w-[210mm] mx-auto my-8 print:my-0">
        {/* ===== PAGE 1: COUVERTURE ===== */}
        <div className="bg-white min-h-[297mm] p-[20mm] flex flex-col shadow-lg print:shadow-none page-break">
          {/* En-tête style document professionnel */}
          <div className="border-2 border-black mb-12">
            <div className="flex items-stretch">
              {/* Logo gauche */}
              <div
                className="border-r-2 border-black p-4 flex items-center justify-center"
                style={{ width: "120px" }}
              >
                <div className="text-center">
                  <div
                    className="font-bold text-2xl text-blue-600"
                    style={{ fontFamily: "Arial" }}
                  >
                    SURVIVE
                  </div>
                  <div className="text-xs">BCM Platform</div>
                </div>
              </div>

              {/* Titre central */}
              <div className="flex-1 p-4 flex items-center justify-center border-r-2 border-black">
                <div className="text-center">
                  <div className="font-bold text-sm">
                    Rapport d&apos;analyse d&apos;impact - BIA - Processus{" "}
                    {report.factory?.name || "Organisation"}
                  </div>
                </div>
              </div>

              {/* Info droite */}
              <div className="p-2" style={{ width: "100px" }}>
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="border border-black px-1 py-0.5 font-semibold bg-gray-100">
                        Réf.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-1 py-0.5">
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-1 py-0.5 font-semibold bg-gray-100">
                        Date
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-1 py-0.5 font-semibold bg-gray-100">
                        Page 1 sur {processes.length + 10}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Contenu centré */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center space-y-12">
              {/* Titre principal */}
              <div>
                <h1 className="text-xl font-bold mb-4 underline">
                  Processus Assurance Qualité
                </h1>
                <h2 className="text-2xl font-bold mb-2">
                  Rapport d&apos;analyse d&apos;impact (BIA)
                </h2>
                <h3 className="text-xl font-bold">
                  {report.factory?.name || report.name}
                </h3>
              </div>

              {/* Tableau informations document */}
              <div className="mx-auto" style={{ width: "400px" }}>
                <table className="w-full border-2 border-black text-sm">
                  <tbody>
                    <tr>
                      <td
                        className="border border-black px-3 py-2 font-bold bg-gray-100"
                        style={{ width: "150px" }}
                      >
                        Réf Document
                      </td>
                      <td className="border border-black px-3 py-2">
                        {metadata.reference ||
                          `BIA-${report.id.slice(0, 8).toUpperCase()}`}
                      </td>
                      <td
                        className="border border-black px-3 py-2 font-bold bg-gray-100"
                        style={{ width: "120px" }}
                      >
                        Classification
                      </td>
                      <td className="border border-black px-3 py-2">
                        {metadata.classification || "Confidentiel"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-3 py-2 font-bold bg-gray-100">
                        N° Version
                      </td>
                      <td className="border border-black px-3 py-2">
                        {metadata.version || "1.0"}
                      </td>
                      <td className="border border-black px-3 py-2 font-bold bg-gray-100">
                        Validé par
                      </td>
                      <td className="border border-black px-3 py-2">
                        {report.author
                          ? `${report.author.firstName || ""} ${
                              report.author.lastName || ""
                            }`
                          : "À compléter"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-3 py-2 font-bold bg-gray-100">
                        Date de création
                      </td>
                      <td className="border border-black px-3 py-2">
                        {format(new Date(report.createdAt), "dd-MM-yyyy", {
                          locale: fr,
                        })}
                      </td>
                      <td className="border border-black px-3 py-2 font-bold bg-gray-100">
                        Fedia Bayouness
                      </td>
                      <td className="border border-black px-3 py-2">
                        Fedia Bayouness
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="text-center text-xs text-gray-600 mt-8">1#</div>
        </div>

        {/* ===== PAGE 2: FICHE D'IDENTIFICATION ===== */}
        <div className="bg-white min-h-[297mm] p-[20mm] shadow-lg print:shadow-none page-break">
          <PageHeader pageNumber="2" />

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-black pb-2 mb-6">
              1. Fiche d&apos;Identification du Document
            </h2>
          </div>

          <div className="space-y-8">
            <div className="border-2 border-black p-6">
              <h3 className="font-bold text-base mb-4 text-gray-900 underline">
                Informations Générales
              </h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700 w-1/3 border-b border-gray-300">
                      Titre du document
                    </td>
                    <td className="py-2 text-gray-900 border-b border-gray-300">
                      {report.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700 border-b border-gray-300">
                      Référence
                    </td>
                    <td className="py-2 text-gray-900 border-b border-gray-300">
                      {metadata.reference ||
                        `BIA-${report.id.slice(0, 8).toUpperCase()}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700 border-b border-gray-300">
                      Date de création
                    </td>
                    <td className="py-2 text-gray-900 border-b border-gray-300">
                      {format(new Date(report.createdAt), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-gray-700">État</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          report.status === "GENERATED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {report.status}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-gray-700">
                      Préparé par
                    </td>
                    <td className="py-3 text-gray-900">
                      {report.author
                        ? `${report.author.firstName || ""} ${
                            report.author.lastName || ""
                          }`
                        : "À compléter"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-gray-700">
                      Revu par
                    </td>
                    <td className="py-3 text-gray-900">À compléter</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-gray-700">
                      Approuvé par
                    </td>
                    <td className="py-3 text-gray-900">À compléter</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                Historique des Modifications
              </h3>
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Version
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Auteur
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Modifications
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      {metadata.version || "1.0"}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {format(new Date(report.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {report.author
                        ? `${report.author.firstName || ""} ${
                            report.author.lastName || ""
                          }`
                        : "À compléter"}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Création initiale du rapport
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                Liste de Distribution
              </h3>
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Nom
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Fonction
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Organisation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      {report.author
                        ? `${report.author.firstName || ""} ${
                            report.author.lastName || ""
                          }`
                        : "À compléter"}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Responsable BCM
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {report.factory?.name || "À compléter"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      À compléter
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Direction
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {report.factory?.name || "À compléter"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600 text-center border-t pt-6">
            <p className="font-semibold">
              Document confidentiel - Distribution contrôlée
            </p>
            <p className="mt-2">Page 2/{processes.length + 10}</p>
          </div>
        </div>

        {/* ===== PAGE 3: TABLE DES MATIÈRES ===== */}
        <div className="bg-white min-h-[297mm] p-[20mm] shadow-lg print:shadow-none page-break">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3 mb-6">
              Table des Matières
            </h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-dotted">
              <span className="font-semibold">
                1. Fiche d&apos;Identification du Document
              </span>
              <span>2</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dotted">
              <span className="font-semibold">2. Introduction</span>
              <span>4</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dotted">
              <span className="font-semibold">3. Terminologie</span>
              <span>5</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dotted">
              <span className="font-semibold">4. Analyse des Processus</span>
              <span>6</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dotted">
              <span className="font-semibold">
                5. Risques & Recommandations
              </span>
              <span>{6 + processes.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dotted">
              <span className="font-semibold">6. Validation & Acceptation</span>
              <span>{7 + processes.length}</span>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600 text-center border-t pt-6">
            <p>Page 3/{processes.length + 10}</p>
          </div>
        </div>

        {/* ===== PAGE 4: INTRODUCTION ===== */}
        <div className="bg-white min-h-[297mm] p-[20mm] shadow-lg print:shadow-none page-break">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3 mb-6">
              2. Introduction
            </h2>
          </div>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                2.1 Contexte BCM
              </h3>
              <p className="mb-3">
                Le présent rapport de Business Impact Analysis (BIA) a été
                réalisé dans le cadre du programme de Management de la
                Continuité d&apos;Activité (Business Continuity Management -
                BCM) de {report.factory?.name || "l'organisation"}.
              </p>
              <p className="mb-3">
                La BIA constitue une analyse systématique permettant
                d&apos;identifier et d&apos;évaluer les impacts potentiels
                d&apos;une interruption sur les processus critiques de
                l&apos;organisation.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                2.2 Références Normatives
              </h3>
              <p className="mb-3">
                Ce rapport est conforme aux standards internationaux suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <span className="font-semibold">ISO 22301:2019</span> -
                  Sécurité et résilience - Systèmes de management de la
                  continuité d&apos;activité
                </li>
                <li>
                  <span className="font-semibold">ISO/TS 22317:2021</span> -
                  Lignes directrices pour l&apos;analyse d&apos;impact sur
                  l&apos;activité (BIA)
                </li>
                <li>
                  <span className="font-semibold">
                    BCI Good Practice Guidelines
                  </span>{" "}
                  - Business Continuity Institute
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                2.3 Objectifs de la BIA
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Identifier les processus critiques et leurs interdépendances
                </li>
                <li>
                  Évaluer les impacts potentiels d&apos;une interruption dans le
                  temps
                </li>
                <li>
                  Déterminer les objectifs de reprise (RTO, RPO, MTPD, MBCO)
                </li>
                <li>
                  Identifier les ressources critiques nécessaires à la
                  continuité
                </li>
                <li>Établir les priorités de rétablissement</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                2.4 Périmètre
              </h3>
              <p>
                Cette analyse couvre{" "}
                <span className="font-semibold">
                  {summary.totalProcesses || 0} processus
                </span>{" "}
                identifiés comme critiques ou importants pour les opérations de{" "}
                {report.factory?.name || "l'organisation"}.
              </p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600 text-center border-t pt-6">
            <p>Page 4/{processes.length + 10}</p>
          </div>
        </div>

        {/* ===== PAGE 5: TERMINOLOGIE ===== */}
        <div className="bg-white min-h-[297mm] p-[20mm] shadow-lg print:shadow-none page-break">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3 mb-6">
              3. Terminologie
            </h2>
          </div>

          <p className="text-sm text-gray-700 mb-6">
            Les termes et définitions suivants sont utilisés conformément à la
            norme ISO 22301 :
          </p>

          <div className="space-y-4">
            {terminology.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600"
              >
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  {item.term}
                </h4>
                <p className="text-sm text-gray-700">{item.definition}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              Niveaux de Criticité
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="font-semibold">Critique :</span>
                <span className="text-gray-700">
                  Impact majeur immédiat, RTO &lt; 4h
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-600 rounded"></div>
                <span className="font-semibold">Élevé :</span>
                <span className="text-gray-700">
                  Impact significatif, RTO &lt; 24h
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                <span className="font-semibold">Moyen :</span>
                <span className="text-gray-700">
                  Impact modéré, RTO &lt; 72h
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="font-semibold">Faible :</span>
                <span className="text-gray-700">
                  Impact limité, RTO &gt; 72h
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600 text-center border-t pt-6">
            <p>Page 5/{processes.length + 10}</p>
          </div>
        </div>

        {/* ===== PAGES: ANALYSE PAR PROCESSUS ===== */}
        {processes.map((process, processIndex: number) => (
          <div
            key={processIndex}
            className="bg-white min-h-[297mm] p-[20mm] shadow-lg print:shadow-none page-break"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3 mb-6">
                4. Analyse du Processus - {process.name}
              </h2>
            </div>

            {/* 4.1 Informations Générales */}
            <div className="mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                4.1 Informations Générales
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2 font-semibold text-gray-700 w-1/3">
                        Nom du processus
                      </td>
                      <td className="py-2 text-gray-900">{process.name}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-gray-700">
                        Département
                      </td>
                      <td className="py-2 text-gray-900">
                        {process.department || "À compléter"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-gray-700">
                        Responsable
                      </td>
                      <td className="py-2 text-gray-900">
                        {process.owner
                          ? `${process.owner.name} (${process.owner.role})`
                          : "À compléter"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-gray-700">
                        Criticité
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={
                            process.criticality === "critical"
                              ? "destructive"
                              : process.criticality === "high"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {process.criticality === "critical"
                            ? "Critique"
                            : process.criticality === "high"
                            ? "Élevé"
                            : process.criticality === "medium"
                            ? "Moyen"
                            : "Faible"}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4.2 Objectifs de Reprise */}
            <div className="mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                4.2 Objectifs de Reprise Globaux
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                  <p className="text-xs text-gray-600 font-semibold mb-2">
                    RTO
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {process.rto}h
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
                  <p className="text-xs text-gray-600 font-semibold mb-2">
                    RPO
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {process.rpo}h
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 text-center">
                  <p className="text-xs text-gray-600 font-semibold mb-2">
                    MTPD
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {process.mtpd}h
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                  <p className="text-xs text-gray-600 font-semibold mb-2">
                    MBCO
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {process.mtpd > 24
                      ? "30%"
                      : process.mtpd > 8
                      ? "50%"
                      : "80%"}
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3 Analyse des Impacts */}
            <div className="mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                4.3 Analyse des Impacts
              </h3>
              <table className="w-full text-xs border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      Catégorie
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      Impact
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      Évaluation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {impactCategories.map((cat, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-3 py-2 font-semibold">
                        {cat.category}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {cat.description}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <Badge
                          variant={
                            process.criticality === "critical"
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {process.criticality === "critical"
                            ? "Élevé"
                            : "Modéré"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4.4 Analyse Détaillée des Activités */}
            {process.activities && process.activities.length > 0 ? (
              <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  4.4 Analyse Détaillée des Activités
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                          Activité
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                          Rôle
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                          Impact
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                          RTO
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                          RPO
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                          MBCO
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                          Solution
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {process.activities.map((activity, actIdx) => (
                        <tr key={actIdx}>
                          <td className="border border-gray-300 px-2 py-2">
                            {activity.name}
                          </td>
                          <td className="border border-gray-300 px-2 py-2">
                            {activity.role}
                          </td>
                          <td className="border border-gray-300 px-2 py-2">
                            {activity.impact}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {activity.rto}h
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {activity.rpo}h
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {activity.mbco}
                          </td>
                          <td className="border border-gray-300 px-2 py-2">
                            {activity.workaround}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  4.4 Analyse Détaillée des Activités
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-yellow-800">
                    ⚠️ À compléter
                  </p>
                  <p className="text-gray-700 mt-2">
                    Les activités détaillées de ce processus doivent être
                    documentées lors de la prochaine révision.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-12 text-sm text-gray-600 text-center border-t pt-6">
              <p>
                Page {6 + processIndex}/{processes.length + 10}
              </p>
            </div>
          </div>
        ))}

        {/* ===== PAGE: RISQUES & RECOMMANDATIONS ===== */}
        <div className="bg-white min-h-[297mm] p-[20mm] shadow-lg print:shadow-none page-break">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3 mb-6">
              5. Risques & Recommandations
            </h2>
          </div>

          {/* 5.1 Risques Identifiés */}
          {risks.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                5.1 Risques Identifiés
              </h3>
              <div className="space-y-4">
                {risks.map((risk, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-red-600 bg-red-50 pl-4 py-3 rounded-r-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        {risk.type}
                      </h4>
                      <Badge
                        variant={
                          risk.severity === "Critique"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5.2 Recommandations */}
          {recommendations.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                5.2 Recommandations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{rec}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5.3 Prochaines Étapes */}
          <div className="mb-8">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              5.3 Prochaines Étapes
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Actions BCP (Business Continuity Plan)
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 ml-6 space-y-1">
                    <li>
                      Élaborer les plans de continuité pour les processus
                      critiques
                    </li>
                    <li>Définir les procédures de basculement et de reprise</li>
                    <li>Documenter les plans de communication de crise</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Actions Techniques
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 ml-6 space-y-1">
                    <li>
                      Mettre en place les solutions de sauvegarde et de
                      redondance
                    </li>
                    <li>Tester les procédures de reprise IT</li>
                    <li>
                      Valider les RTO/RPO avec les capacités techniques
                      actuelles
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Actions Organisationnelles
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 ml-6 space-y-1">
                    <li>Former le personnel aux procédures de continuité</li>
                    <li>Organiser des exercices de simulation</li>
                    <li>Réviser et mettre à jour la BIA annuellement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600 text-center border-t pt-6">
            <p>
              Page {processes.length + 6}/{processes.length + 10}
            </p>
          </div>
        </div>

        {/* ===== PAGE FINALE: VALIDATION & ACCEPTATION ===== */}
        <div className="bg-white min-h-[297mm] p-[20mm] shadow-lg print:shadow-none page-break">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3 mb-6">
              6. Validation & Acceptation du Document
            </h2>
          </div>

          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              Ce rapport de Business Impact Analysis a été préparé conformément
              aux normes ISO 22301:2019 et ISO/TS 22317:2021. Les informations
              contenues dans ce document sont basées sur les données collectées
              au
              <span className="font-semibold">
                {" "}
                {format(new Date(report.createdAt), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </span>
              .
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Signatures et Approbations
              </h3>
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Rôle
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Nom
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      Signature
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-4 font-semibold">
                      Préparé par
                    </td>
                    <td className="border border-gray-300 px-4 py-4">
                      {report.author
                        ? `${report.author.firstName || ""} ${
                            report.author.lastName || ""
                          }`
                        : "À compléter"}
                    </td>
                    <td className="border border-gray-300 px-4 py-4">
                      {format(new Date(report.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="border border-gray-300 px-4 py-4 bg-gray-50"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-4 font-semibold">
                      Approuvé par
                    </td>
                    <td className="border border-gray-300 px-4 py-4">
                      À compléter
                    </td>
                    <td className="border border-gray-300 px-4 py-4"></td>
                    <td className="border border-gray-300 px-4 py-4 bg-gray-50"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Déclaration de Conformité
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Je certifie que cette Business Impact Analysis a été menée selon
                les meilleures pratiques du secteur et en conformité avec les
                normes ISO 22301:2019 et ISO/TS 22317:2021.
              </p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600 text-center border-t pt-6">
            <p className="font-semibold">Fin du Rapport BIA</p>
            <p className="mt-2">
              Page {processes.length + 7}/{processes.length + 10}
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Document généré automatiquement par SURVIVE BCM Platform - ISO
              22301:2019 Compliant
            </p>
          </div>
        </div>
      </div>

      {/* Style pour l&apos;impression */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
          }

          body {
            background: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* === STYLE DOCUMENT PROFESSIONNEL === */

          /* Masquer tous les éléments web et header */
          .print\\:hidden,
          button,
          [data-print-hide],
          .shadow-lg,
          .shadow-sm,
          .shadow,
          .sticky,
          .border-b,
          header,
          nav,
          .bg-white.border-b {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Cacher spécifiquement le header avec actions */
          div.bg-white.border-b.print\\:hidden,
          .max-w-\\[210mm\\].mx-auto.px-6.py-4 {
            display: none !important;
          }

          /* Container principal prend toute la page */
          .w-full.bg-gray-50 {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Typographie professionnelle */
          body,
          * {
            font-family: "Arial", "Helvetica", sans-serif !important;
            color: #000000 !important;
          }

          /* En-tête professionnel avec bordures */
          .border-2.border-black {
            border: 2px solid #000000 !important;
            display: flex !important;
            visibility: visible !important;
            background: white !important;
          }

          .border-2.border-black .border-r-2 {
            border-right: 2px solid #000000 !important;
          }

          /* Logo SURVIVE visible */
          .text-blue-600 {
            color: #1e40af !important;
          }

          /* AUCUN effet web */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
            border-radius: 0 !important;
            background-image: none !important;
            background-attachment: initial !important;
          }

          /* Conteneur principal */
          .max-w-\\[210mm\\] {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .min-h-\\[297mm\\] {
            min-height: auto !important;
            padding: 20mm 25mm !important;
          }

          /* === TITRES PROFESSIONNELS === */
          h1 {
            font-size: 16pt !important;
            font-weight: 700 !important;
            text-align: center !important;
            margin: 18pt 0 12pt 0 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5pt !important;
            color: #000000 !important;
          }

          h2 {
            font-size: 13pt !important;
            font-weight: 700 !important;
            margin: 16pt 0 8pt 0 !important;
            border-bottom: 2px solid #000000 !important;
            padding-bottom: 3pt !important;
            color: #000000 !important;
          }

          h3 {
            font-size: 11pt !important;
            font-weight: 700 !important;
            margin: 12pt 0 6pt 0 !important;
            color: #000000 !important;
          }

          h4 {
            font-size: 10pt !important;
            font-weight: 600 !important;
            margin: 10pt 0 5pt 0 !important;
            color: #333333 !important;
          }

          /* === PARAGRAPHES STYLE ACADÉMIQUE === */
          p {
            font-size: 11pt !important;
            line-height: 1.6 !important;
            text-align: justify !important;
            margin: 6pt 0 !important;
            text-indent: 0 !important;
          }

          /* === TABLEAUX PROFESSIONNELS === */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin: 10pt 0 !important;
            font-size: 10pt !important;
          }

          table caption {
            font-size: 10pt !important;
            font-weight: 700 !important;
            text-align: center !important;
            margin-bottom: 6pt !important;
            font-style: italic !important;
          }

          th {
            background-color: #f0f0f0 !important;
            font-weight: 700 !important;
            padding: 8pt !important;
            border: 1px solid #000000 !important;
            text-align: left !important;
          }

          td {
            padding: 6pt 8pt !important;
            border: 1px solid #000000 !important;
            vertical-align: top !important;
          }

          thead {
            display: table-header-group !important;
          }

          /* === LISTES ACADÉMIQUES === */
          ul,
          ol {
            margin: 8pt 0 8pt 20pt !important;
            padding: 0 !important;
            line-height: 1.6 !important;
          }

          li {
            font-size: 11pt !important;
            margin-bottom: 4pt !important;
            text-align: justify !important;
          }

          /* === BADGES SIMPLES === */
          .inline-flex,
          [class*="Badge"],
          span[class*="badge"] {
            border: 1px solid #666666 !important;
            padding: 1pt 6pt !important;
            background-color: white !important;
            color: #000000 !important;
            font-weight: 600 !important;
            font-size: 9pt !important;
            border-radius: 0 !important;
            display: inline !important;
          }

          /* Supprimer les badges décoratifs */
          .inline-flex:has(svg) {
            border: none !important;
            padding: 0 !important;
          }

          /* === ARRIÈRE-PLANS DOCUMENT UNIQUEMENT === */
          .bg-gray-50,
          .bg-gray-100,
          .bg-gradient-to-br,
          .from-blue-50,
          .to-blue-100,
          .from-blue-600,
          .to-blue-700,
          .bg-blue-600,
          .bg-blue-700,
          div[class*="bg-"],
          div[class*="gradient"] {
            background-color: #ffffff !important;
            background-image: none !important;
            background: white !important;
            border: 1px solid #d0d0d0 !important;
          }

          .bg-white {
            background-color: #ffffff !important;
            border: none !important;
          }

          /* Tous les conteneurs colorés deviennent blancs */
          div[class*="blue"],
          div[class*="indigo"],
          div[class*="purple"] {
            background: white !important;
            color: #000000 !important;
          }

          /* === ICÔNES MINIMALISTES === */
          svg {
            color: #000000 !important;
            fill: #000000 !important;
            width: 14pt !important;
            height: 14pt !important;
          }

          /* Enlever toutes les couleurs web */
          .text-blue-600,
          .text-blue-700,
          .text-blue-500,
          .text-indigo-600,
          .text-purple-600,
          div[class*="text-blue"],
          span[class*="text-blue"],
          p[class*="text-blue"] {
            color: #000000 !important;
          }

          /* Icônes décoratives cachées */
          .p-4.bg-gradient-to-br,
          div[class*="rounded-xl"] svg {
            display: none !important;
          }

          /* === GESTION DES SAUTS DE PAGE === */
          .page-break {
            page-break-after: always !important;
            break-after: always !important;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }

          table,
          .bg-gray-50,
          .bg-gray-100 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          /* === EN-TÊTES ET PIEDS DE PAGE STYLE PFE === */
          @page {
            @top-left {
              content: "Rapport BIA";
              font-family: "Times New Roman", serif;
              font-size: 9pt;
              color: #666666;
              font-style: italic;
            }

            @top-right {
              content: string(chapter);
              font-family: "Times New Roman", serif;
              font-size: 9pt;
              color: #666666;
              font-style: italic;
            }

            @bottom-center {
              content: counter(page);
              font-family: "Times New Roman", serif;
              font-size: 10pt;
              font-weight: 700;
            }

            @bottom-left {
              content: "ISO 22301:2019";
              font-family: "Times New Roman", serif;
              font-size: 8pt;
              color: #999999;
            }

            @bottom-right {
              content: "Confidentiel";
              font-family: "Times New Roman", serif;
              font-size: 9pt;
              color: #666666;
              font-weight: 700;
            }
          }

          /* Première page (page de garde) sans en-tête/pied de page */
          @page :first {
            @top-left {
              content: none;
            }
            @top-right {
              content: none;
            }
            @bottom-left {
              content: none;
            }
            @bottom-center {
              content: none;
            }
            @bottom-right {
              content: none;
            }
          }

          /* === ESPACEMENT ACADÉMIQUE === */
          section,
          div[class*="space-y"] > * + * {
            margin-top: 10pt !important;
          }

          /* === LIGNES ET SÉPARATEURS === */
          hr,
          .border-t,
          .border-b {
            border-color: #000000 !important;
            border-width: 1pt !important;
            margin: 12pt 0 !important;
          }

          /* === NIVEAUX DE GRIS UNIQUEMENT === */
          .bg-red-600,
          .text-red-600 {
            background-color: #1a1a1a !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
          }

          .bg-orange-600,
          .text-orange-600 {
            background-color: #404040 !important;
            color: #000000 !important;
            border: 2px solid #333333 !important;
          }

          .bg-yellow-600,
          .text-yellow-600 {
            background-color: #808080 !important;
            color: #000000 !important;
            border: 1px solid #666666 !important;
          }

          .bg-green-600,
          .text-green-600 {
            background-color: #cccccc !important;
            color: #000000 !important;
            border: 1px solid #999999 !important;
          }

          /* === CITATIONS ET ENCADRÉS === */
          blockquote {
            border-left: 3pt solid #000000 !important;
            padding-left: 12pt !important;
            margin: 12pt 0 !important;
            font-style: italic !important;
          }

          /* === NOTES DE BAS DE PAGE === */
          .footnote {
            font-size: 9pt !important;
            line-height: 1.3 !important;
          }

          /* === NUMÉROTATION DES CHAPITRES === */
          body {
            counter-reset: chapter section subsection;
          }

          /* === OPTIMISATION GLOBALE === */
          * {
            font-smoothing: antialiased !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }
        }
      `}</style>
    </div>
  );
}
