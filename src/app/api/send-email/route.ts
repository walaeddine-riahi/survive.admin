import { spawn } from "child_process";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
  try {
    const { email, firstName, simulationTitle } = await req.json();

    if (!email || !firstName || !simulationTitle) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Chemin vers le script Python
    const pythonScript = path.join(process.cwd(), "src/lib/email.py");

    // Exécuter le script Python
    const pythonProcess = spawn("python", [
      pythonScript,
      email,
      firstName,
      simulationTitle,
    ]);

    return new Promise((resolve, reject) => {
      let output = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ message: "Email sent successfully" }));
        } else {
          reject(
            NextResponse.json(
              { error: "Failed to send email" },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new NextResponse("Error sending email", { status: 500 });
  }
}
