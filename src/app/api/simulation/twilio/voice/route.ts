import { NextRequest, NextResponse } from "next/server";
import { buildCallTwiml } from "@/lib/simulation/twilio";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params = Object.fromEntries(formData) as Record<string, string>;

  const callerName = req.nextUrl.searchParams.get("callerName") || "Simulation";
  const encodedScript = req.nextUrl.searchParams.get("script") || "";
  const script = decodeURIComponent(encodedScript);

  const twiml = buildCallTwiml(callerName, script);

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET(req: NextRequest) {
  const callerName = req.nextUrl.searchParams.get("callerName") || "Simulation";
  const encodedScript = req.nextUrl.searchParams.get("script") || "";
  const script = decodeURIComponent(encodedScript);
  const twiml = buildCallTwiml(callerName, script);
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}
