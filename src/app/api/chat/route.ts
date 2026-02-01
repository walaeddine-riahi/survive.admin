import { aiService } from "@/lib/azure-ai-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message invalide" }, { status: 400 });
    }

    const response = await aiService.chat(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Erreur API chat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500 }
    );
  }
}
