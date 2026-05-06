import { prisma } from "@/lib/prisma";
import ReportBuilderClient from "./report-builder-client";

export default async function BcmReportsPage() {
  const factories = await prisma.factory.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });

  return <ReportBuilderClient factories={factories} />;
}
