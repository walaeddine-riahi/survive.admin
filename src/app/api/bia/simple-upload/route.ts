import { NextRequest, NextResponse } from "next/server";
import { uploadBiaReportSimple } from "@/actions/bia/simple-upload-actions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadBiaReportSimple(formData);

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
