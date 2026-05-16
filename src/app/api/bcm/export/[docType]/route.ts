import { NextResponse } from "next/server";
import { BCMDocxFormatter, BCMSection } from "@/lib/bcm/docx-formatter";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { docType: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { docType } = params;
    const body = await req.json();

    const { organization, sections, title } = body as {
      organization: string;
      sections: BCMSection[];
      title?: string;
    };

    if (!sections || !Array.isArray(sections)) {
      return new NextResponse("Invalid sections data", { status: 400 });
    }

    const docTitle =
      title ||
      (docType === "policy"
        ? "Politique de Continuité d'Activité"
        : docType === "pca"
        ? "Plan de Continuité d'Activité"
        : docType === "pgc"
        ? "Plan de Gestion de Crise"
        : docType === "pri"
        ? "Plan de Reprise Informatique"
        : "Document BCM");

    const dateStr = new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());

    const buffer = await BCMDocxFormatter.generateBuffer({
      title: docTitle,
      organization: organization || "Organisation",
      date: dateStr,
      version: "1.0",
      sections: sections,
    });

    const filename = `${docTitle.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.docx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export BCM Document error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
