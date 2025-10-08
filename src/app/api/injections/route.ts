import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRelations = searchParams.get('include')?.split(',');
    
    const injections = await prisma.injection.findMany({
      include: {
        scenario: includeRelations?.includes('scenario') ? {
          select: {
            id: true,
            name: true,
            simulationId: true
          }
        } : false,
        simulation: includeRelations?.includes('simulation') ? {
          select: {
            id: true,
            title: true
          }
        } : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(injections);
  } catch (error) {
    console.error("Error fetching injections:", error);
    return NextResponse.json(
      { error: "Failed to fetch injections" },
      { status: 500 }
    );
  }
}

enum InjectionTriggerType {
  MANUAL = 'MANUAL',
  TIMED = 'TIMED'
}

enum InjectionType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  MEMO = 'MEMO',
  ALERT = 'ALERT',
  SOCIAL = 'SOCIAL',
  NEWS_BROADCAST = 'NEWS_BROADCAST',
  CALL = 'CALL',
  NEWSPAPER = 'NEWSPAPER',
  OTHER = 'OTHER'
}

interface InjectionData {
  title: string;
  content: string;
  type: InjectionType;
  isActive?: boolean;
  triggerType?: InjectionTriggerType;
  timeOffset?: number | null;
  isRepeating?: boolean;
  repeatInterval?: number | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  attachments?: any[];
  scenarioId: string;
  simulationId: string;
  targetUserId?: string | null;
  payload?: any;
}

export async function POST(request: Request) {
  try {
    const data: InjectionData = await request.json();
    
    // Valider les données requises
    if (!data.title || !data.content || !data.type || !data.scenarioId || !data.simulationId) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être fournis" },
        { status: 400 }
      );
    }
    
    // Vérifier que le scénario existe pour obtenir l'ID de la simulation
    const scenario = await prisma.scenario.findUnique({
      where: { id: data.scenarioId },
      select: { simulationId: true }
    });

    if (!scenario) {
      return NextResponse.json(
        { error: "Scénario non trouvé" },
        { status: 404 }
      );
    }

    // S'assurer que le type est valide
    const validType = Object.values(InjectionType).includes(data.type as InjectionType)
      ? data.type as InjectionType
      : InjectionType.OTHER;

    // S'assurer que le triggerType est valide
    const validTriggerType = data.triggerType && Object.values(InjectionTriggerType).includes(data.triggerType as InjectionTriggerType)
      ? data.triggerType as InjectionTriggerType
      : InjectionTriggerType.MANUAL;

    // Préparer les données pour la création
    const injectionData = {
      title: data.title,
      content: data.content,
      type: validType,
      isActive: data.isActive ?? true,
      triggerType: validTriggerType,
      timeOffset: data.timeOffset,
      isRepeating: data.isRepeating ?? false,
      repeatInterval: data.repeatInterval,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      attachments: data.attachments || [],
      scenarioId: data.scenarioId,  // Utiliser directement l'ID pour la relation
      simulationId: scenario.simulationId,  // Utiliser l'ID de la simulation du scénario
      targetUserId: data.targetUserId || null,
      payload: data.payload || {}
    };
    
    // Créer l'injection dans la base de données
    const injection = await prisma.injection.create({
      data: injectionData,
      include: {
        scenario: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(injection, { status: 201 });
  } catch (error) {
    console.error("Error creating injection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create injection" },
      { status: 500 }
    );
  }
}
