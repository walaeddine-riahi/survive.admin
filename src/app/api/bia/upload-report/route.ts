import { NextRequest, NextResponse } from "next/server";
import { uploadBiaReport } from "@/actions/bia/upload-report-actions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadBiaReport(formData);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Erreur API upload:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
