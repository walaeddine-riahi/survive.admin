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

interface Process {
  id: string;
  name: string;
  department: string;
  rto: number;
  mtpd: number;
  criticality: string;
}

interface FactoryProcessesListProps {
  processes: Process[];
  factoryId: string;
}

const getCriticalityBadge = (criticality: string) => {
  const variants = {
    CRITICAL: {
      color: "bg-red-100 text-red-800 border-red-300",
      label: "🔴 Critique",
    },
    HIGH: {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      label: "🟠 Élevé",
    },
    MEDIUM: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      label: "🟡 Moyen",
    },
    LOW: {
      color: "bg-green-100 text-green-800 border-green-300",
      label: "🟢 Faible",
    },
  };

  const variant =
    variants[criticality as keyof typeof variants] || variants.MEDIUM;

  return (
    <Badge
      variant="outline"
      className={`${variant.color} font-medium border-2`}
    >
      {variant.label}
    </Badge>
  );
};

export function FactoryProcessesList({ processes }: FactoryProcessesListProps) {
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const toggleProcess = (processId: string) => {
    setSelectedProcesses((prev) =>
      prev.includes(processId)
        ? prev.filter((id) => id !== processId)
        : [...prev, processId]
    );
  };

  const toggleAll = () => {
    if (selectedProcesses.length === processes.length) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(processes.map((p) => p.id));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/bia/processes/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processIds: selectedProcesses }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      toast.success("Processus supprimés", {
        description: `${selectedProcesses.length} processus supprimé${
          selectedProcesses.length > 1 ? "s" : ""
        } avec succès`,
      });

      setSelectedProcesses([]);
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

  if (processes.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucun processus associé à cette usine
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
                checked={selectedProcesses.length === processes.length}
                onCheckedChange={toggleAll}
                id="select-all-processes"
                className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all duration-200 hover:border-blue-500"
              />
            </div>
            <label
              htmlFor="select-all-processes"
              className="text-sm font-semibold cursor-pointer select-none hover:text-blue-600 transition-colors"
            >
              Sélectionner tout
              <span className="ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-xs font-bold">
                {selectedProcesses.length}/{processes.length}
              </span>
            </label>
          </div>

          {selectedProcesses.length > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {selectedProcesses.length} sélectionné
                {selectedProcesses.length > 1 ? "s" : ""}
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

        {/* Liste des processus avec checkboxes stylées */}
        <div className="space-y-2">
          {processes.map((process) => (
            <div
              key={process.id}
              className={`group relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                selectedProcesses.includes(process.id)
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-md"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
              }`}
            >
              {/* Checkbox personnalisée avec animation */}
              <div className="relative flex items-center pt-1">
                <Checkbox
                  checked={selectedProcesses.includes(process.id)}
                  onCheckedChange={() => toggleProcess(process.id)}
                  id={`process-${process.id}`}
                  className={`h-5 w-5 rounded-md border-2 transition-all duration-200 ${
                    selectedProcesses.includes(process.id)
                      ? "bg-blue-600 border-blue-600 scale-110"
                      : "border-slate-300 hover:border-blue-500 hover:scale-105"
                  }`}
                />
                {selectedProcesses.includes(process.id) && (
                  <div className="absolute inset-0 rounded-md bg-blue-400 animate-ping opacity-25" />
                )}
              </div>

              <Link
                href={`/bia/processes/${process.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base hover:text-primary truncate transition-colors group-hover:text-blue-600">
                      {process.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {process.department}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium">RTO: {process.rto}h</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium">MTPD: {process.mtpd}h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {getCriticalityBadge(process.criticality)}
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
              Supprimer {selectedProcesses.length} processus
              {selectedProcesses.length > 1 ? "" : ""} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les processus suivants seront
              définitivement supprimés :
              <ul className="mt-2 list-disc list-inside space-y-1">
                {processes
                  .filter((p) => selectedProcesses.includes(p.id))
                  .map((p) => (
                    <li key={p.id} className="text-sm">
                      {p.name}
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
