import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BiaReportViewer } from "@/components/bia/bia-report-viewer";

export const metadata: Metadata = {
  title: "Visualisation Rapport BIA",
  description: "Vue détaillée du rapport d'analyse d'impact sur les activités",
};

interface ReportViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getReportDetails(id: string) {
  const report = await prisma.biaReport.findUnique({
    where: { id },
    include: {
      factory: {
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          city: true,
          country: true,
        },
      },
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return report;
}

export default async function ReportViewPage({ params }: ReportViewPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const report = await getReportDetails(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BiaReportViewer report={report} />
    </div>
  );
}
