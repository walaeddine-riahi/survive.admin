"use client";

import {
  BiaReportList,
  BiaReportWithAuthor,
} from "@/components/bia/bia-report-list";
import { SimpleFileUpload } from "@/components/bia/simple-file-upload";
import { BiaReportManager } from "@/components/bia/bia-report-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface BiaReportsPageClientProps {
  initialReports: BiaReportWithAuthor[];
}

export function BiaReportsPageClient({
  initialReports,
}: BiaReportsPageClientProps) {
  const router = useRouter();

  const handleUploadSuccess = () => {
    // Recharger la page pour afficher le nouveau rapport
    router.refresh();
  };

  return (
    <Tabs defaultValue="reports" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="reports">Mes Rapports</TabsTrigger>
        <TabsTrigger value="upload">Importer un Fichier</TabsTrigger>
        <TabsTrigger value="manage">Gérer les Fichiers</TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="mt-6">
        <BiaReportList initialReports={initialReports} />
      </TabsContent>

      <TabsContent value="upload" className="mt-6">
        <SimpleFileUpload onUploadSuccess={handleUploadSuccess} />
      </TabsContent>

      <TabsContent value="manage" className="mt-6">
        <BiaReportManager />
      </TabsContent>
    </Tabs>
  );
}
