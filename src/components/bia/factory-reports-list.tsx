"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  status: string;
  totalProcesses: number;
  continuityLevel: number | null;
  createdAt: Date;
}

interface FactoryReportsListProps {
  reports: Report[];
  factoryId: string;
}

export function FactoryReportsList({ reports }: FactoryReportsListProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const toggleReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const toggleAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map((r) => r.id));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/bia/reports/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportIds: selectedReports }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      toast.success("Rapports supprimés", {
        description: `${selectedReports.length} rapport${
          selectedReports.length > 1 ? "s" : ""
        } supprimé${selectedReports.length > 1 ? "s" : ""} avec succès`,
      });

      setSelectedReports([]);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (reports.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucun rapport BIA pour cette usine
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Barre d'actions stylée */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Checkbox
                checked={selectedReports.length === reports.length}
                onCheckedChange={toggleAll}
                id="select-all"
                className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all duration-200 hover:border-blue-500"
              />
            </div>
            <label
              htmlFor="select-all"
              className="text-sm font-semibold cursor-pointer select-none hover:text-blue-600 transition-colors"
            >
              Sélectionner tout
              <span className="ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-xs font-bold">
                {selectedReports.length}/{reports.length}
              </span>
            </label>
          </div>

          {selectedReports.length > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {selectedReports.length} sélectionné
                {selectedReports.length > 1 ? "s" : ""}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Liste des rapports avec checkboxes stylées */}
        <div className="space-y-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`group relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                selectedReports.includes(report.id)
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-md"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
              }`}
            >
              {/* Checkbox personnalisée avec animation */}
              <div className="relative flex items-center pt-1">
                <Checkbox
                  checked={selectedReports.includes(report.id)}
                  onCheckedChange={() => toggleReport(report.id)}
                  id={`report-${report.id}`}
                  className={`h-5 w-5 rounded-md border-2 transition-all duration-200 ${
                    selectedReports.includes(report.id)
                      ? "bg-blue-600 border-blue-600 scale-110"
                      : "border-slate-300 hover:border-blue-500 hover:scale-105"
                  }`}
                />
                {selectedReports.includes(report.id) && (
                  <div className="absolute inset-0 rounded-md bg-blue-400 animate-ping opacity-25" />
                )}
              </div>

              <Link
                href={`/bia/reports/${report.id}/view`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base hover:text-primary truncate transition-colors group-hover:text-blue-600">
                      {report.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {report.totalProcesses} processus
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>
                        Créé le{" "}
                        {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge variant="outline" className="font-medium border-2">
                      {report.status}
                    </Badge>
                    {report.continuityLevel && (
                      <div className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                        {report.continuityLevel}%
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog de confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {selectedReports.length} rapport
              {selectedReports.length > 1 ? "s" : ""} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les rapports suivants seront
              définitivement supprimés :
              <ul className="mt-2 list-disc list-inside space-y-1">
                {reports
                  .filter((r) => selectedReports.includes(r.id))
                  .map((r) => (
                    <li key={r.id} className="text-sm">
                      {r.name}
                    </li>
                  ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
