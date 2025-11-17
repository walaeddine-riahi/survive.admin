"use client";

import {
  BiaReportList,
  BiaReportWithAuthor,
} from "@/components/bia/bia-report-list";
import { SimpleFileUpload } from "@/components/bia/simple-file-upload";
import { BiaReportManager } from "@/components/bia/bia-report-manager";
import { ProcessReportGenerator } from "@/components/bia/process-report-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

type Factory = {
  id: string;
  name: string;
  code: string;
};

interface BiaReportsPageClientProps {
  initialReports: BiaReportWithAuthor[];
  factories: Factory[];
}

export function BiaReportsPageClient({
  initialReports,
  factories,
}: BiaReportsPageClientProps) {
  const router = useRouter();

  const handleUploadSuccess = () => {
    // Recharger la page pour afficher le nouveau rapport
    router.refresh();
  };

  return (
    <Tabs defaultValue="reports" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="reports">Mes Rapports</TabsTrigger>
        <TabsTrigger value="generate">Générer depuis Processus</TabsTrigger>
        <TabsTrigger value="upload">Importer un Fichier</TabsTrigger>
        <TabsTrigger value="manage">Gérer les Fichiers</TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="mt-6">
        <BiaReportList initialReports={initialReports} factories={factories} />
      </TabsContent>

      <TabsContent value="generate" className="mt-6">
        <ProcessReportGenerator factories={factories} />
      </TabsContent>

      <TabsContent value="upload" className="mt-6">
        <SimpleFileUpload
          onUploadSuccess={handleUploadSuccess}
          factories={factories}
        />
      </TabsContent>

      <TabsContent value="manage" className="mt-6">
        <BiaReportManager />
      </TabsContent>
    </Tabs>
  );
}
