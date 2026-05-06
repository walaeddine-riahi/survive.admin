import { prisma } from "@/lib/prisma";
import { ComplianceClient } from "@/components/compliance/compliance-client";

export default async function CompliancePage() {
  // Récupérer les usines avec leurs certifications
  const factories = await prisma.factory.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      certifications: true,
      complianceStandards: true,
    },
    orderBy: { name: "asc" },
  });

  // Récupérer les processus avec leurs obligations légales et exigences
  const processes = await prisma.process.findMany({
    select: {
      id: true,
      name: true,
      department: true,
      legalObligations: true,
      legalRequirements: {
        select: {
          id: true,
          name: true,
          description: true,
        }
      }
    },
    where: {
      OR: [
        {
          legalObligations: {
            not: null,
          },
        },
        {
          legalRequirements: {
            some: {},
          },
        },
      ],
    },
    orderBy: { name: "asc" },
  });

  return <ComplianceClient factories={factories} processes={processes} />;
}