import { NextRequest, NextResponse } from "next/server";
import { parseCrisisPlanWithAI } from "@/actions/simulation/analysis-actions";
import { saveParsedCrisisPlan } from "@/actions/simulation/crisis-plan-actions";

export async function POST(req: NextRequest) {
  try {
    const { simulationId, rawText } = await req.json();
    if (!simulationId || !rawText) {
      return NextResponse.json({ success: false, error: "simulationId et rawText requis" }, { status: 400 });
    }

    const result = await parseCrisisPlanWithAI(simulationId, rawText);
    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    await saveParsedCrisisPlan(simulationId, result.data, result.summary || "");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Parse plan error:", error);
    return NextResponse.json({ success: false, error: "Erreur analyse plan" }, { status: 500 });
  }
}
