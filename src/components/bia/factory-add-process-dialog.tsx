"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProcessFormSpreadsheet } from "@/components/bia/process-form-spreadsheet";

interface FactoryAddProcessDialogProps {
  factoryId: string;
  factoryName: string;
}

export function FactoryAddProcessDialog({
  factoryId,
  factoryName,
}: FactoryAddProcessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Processus
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] max-h-[98vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0">
          <DialogTitle>Nouveau Processus pour {factoryName}</DialogTitle>
          <DialogDescription>
            Créer un nouveau processus BIA associé à cette usine
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ProcessFormSpreadsheet
            factories={[{ id: factoryId, name: factoryName, code: "" }]}
            initialData={{ factoryId }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
