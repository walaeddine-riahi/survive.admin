import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ReactPDF from "@react-pdf/renderer";
import { BIAReportPDF } from "@/lib/pdf/bia-report-template";

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
  activities?: Array<{
    name: string;
    role: string;
    impact: string;
    rto: number;
    rpo: number;
    mbco: string;
    workaround: string;
  }>;
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
  summary?: {
    totalProcesses?: number;
    globalContinuityLevel?: {
      score?: number;
      level?: string;
    };
  };
  risks?: Array<{
    type: string;
    description: string;
    severity: string;
  }>;
  recommendations?: string[];
  processes?: ProcessData[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Récupérer le rapport
    const report = await prisma.biaReport.findUnique({
      where: { id },
      include: {
        factory: true,
        author: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    const reportData = (report.reportData as ReportDataStructure) || {};

    // Générer le PDF avec React-PDF
    const pdfStream = await ReactPDF.renderToStream(
      BIAReportPDF({ report, reportData })
    );

    // Convertir le stream en buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk as Uint8Array);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Préparer le nom de fichier
    const factoryName =
      report.factory?.name?.replace(/[^a-z0-9]/gi, "_") || "Organisation";
    const dateStr = format(new Date(report.createdAt), "yyyy-MM-dd");
    const fileName = `BIA_Rapport_${factoryName}_${dateStr}.pdf`;

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du PDF",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
