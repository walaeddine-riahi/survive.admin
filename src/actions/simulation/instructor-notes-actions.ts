"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Get instructor notes for a session
 */
export async function getInstructorNotes(sessionId: string) {
  try {
    const session = await prisma.simSession.findUnique({
      where: { id: sessionId },
      select: { 
        instructorNotes: true,
        id: true,
        title: true,
      },
    });
    
    return { success: true, data: session };
  } catch (error) {
    console.error("getInstructorNotes error:", error);
    return { success: false, error: "Erreur récupération des notes" };
  }
}

/**
 * Update instructor notes for a session
 * This saves the notes to the instructorNotes field in SimSession
 */
export async function updateInstructorNotes(
  sessionId: string,
  notes: string
) {
  try {
    const session = await prisma.simSession.update({
      where: { id: sessionId },
      data: { 
        instructorNotes: notes,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        instructorNotes: true,
      },
    });

    revalidatePath("/simulation");
    return { success: true, data: session };
  } catch (error) {
    console.error("updateInstructorNotes error:", error);
    return { success: false, error: "Erreur sauvegarde des notes" };
  }
}

/**
 * Append a note entry to the instructor notes
 * Creates timestamped entries for organized note-taking
 */
export async function appendInstructorNote(
  sessionId: string,
  note: string,
  category?: "observation" | "decision" | "improvement" | "alert" | "general"
) {
  try {
    const currentSession = await prisma.simSession.findUnique({
      where: { id: sessionId },
      select: { instructorNotes: true },
    });

    const timestamp = new Date().toLocaleString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const categoryLabels = {
      observation: "👁️ Observation",
      decision: "✅ Décision",
      improvement: "💡 Amélioration",
      alert: "⚠️ Alerte",
      general: "📝 Note",
    };

    const categoryLabel = categoryLabels[category || "general"];
    const newEntry = `[${timestamp}] ${categoryLabel}: ${note}`;
    
    const existingNotes = currentSession?.instructorNotes || "";
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${newEntry}`
      : newEntry;

    const session = await prisma.simSession.update({
      where: { id: sessionId },
      data: { 
        instructorNotes: updatedNotes,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/simulation");
    return { success: true, data: session };
  } catch (error) {
    console.error("appendInstructorNote error:", error);
    return { success: false, error: "Erreur ajout de note" };
  }
}
