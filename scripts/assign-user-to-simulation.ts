
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const SIMULATION_ID = '6875db2bd9f6f84c303bd1d6';

const ROLE_REPLACEMENTS: Record<string, string> = {
  'Direction Générale': 'DGA (Directeur Général Adjoint)',
  'Direction QSE': 'Responsable Qualité',
  'Direction Supply chain': 'D Supply (Directeur Supply Chain)',
  'Direction Maintenance': 'Responsable Maintenance',
  'Direction Production': 'Responsable Production',
  'Direction Finance': 'Directeur Financier',
  'Cadre S  contrôle de gestion': 'Contrôle de Gestion',
};

const USERS_WITH_ROLES = [
  { email: 'walid.jari@groupedelice.com.tn', role: 'Direction Générale' },
  { email: 'bellila.wissem@groupedelice.com.tn', role: 'Direction QSE' },
  { email: 'khaireddin.becha@groupedelice.com.tn', role: 'Direction Supply chain' },
  { email: 'lassaed.ben.alaya@groupedelice.com.tn', role: 'Direction Maintenance' },
  { email: 'mohamed.allegue@groupedelice.com.tn', role: 'Direction Production' },
  { email: 'mohamed.gara@groupedelice.com.tn', role: 'Cadre S  contrôle de gestion' },
  { email: 'med.amine.ben.hamida@groupedelice.com.tn', role: 'Direction Finance' },
  { email: 'anis.gharbi@groupedelice.com.tn', role: 'Direction Production' }
];

async function assignUserToSimulation(userEmail: string, role: string, teamId?: string) {
  try {
    console.log(`🔍 Recherche utilisateur: ${userEmail}`);
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new Error(`❌ Utilisateur non trouvé: ${userEmail}`);

    const simulation = await prisma.simulation.findUnique({ where: { id: SIMULATION_ID } });
    if (!simulation) throw new Error(`❌ Simulation non trouvée.`);

    const existing = await prisma.simulationAssignment.findFirst({
      where: { userId: user.id, simulationId: SIMULATION_ID }
    });
    if (existing) {
      console.log(`ℹ️ Déjà assigné: ${userEmail}`);
      return;
    }

    const mappedRole = ROLE_REPLACEMENTS[role] || role;

    const assignment = await prisma.simulationAssignment.create({
      data: {
        role: mappedRole,
        status: 'accepted',
        userId: user.id,
        simulationId: SIMULATION_ID,
        ...(teamId && { teamId }),
      },
    });

    console.log(`✅ Assignation faite: ${userEmail} → ${mappedRole}`);
  } catch (error) {
    console.error(`❌ Erreur assignation ${userEmail}:`, error);
  }
}

async function main() {
  console.log('🚀 Début des assignations...');

  for (const { email, role } of USERS_WITH_ROLES) {
    await assignUserToSimulation(email, role);
    await new Promise(res => setTimeout(res, 300));
  }

  await prisma.$disconnect();
  console.log('🎉 Assignations terminées.');
}

main();
