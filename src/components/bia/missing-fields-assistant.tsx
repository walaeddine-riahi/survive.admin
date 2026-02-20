"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";

interface MissingField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  options?: string[];
  required?: boolean;
  description?: string;
  category?: string;
}

interface MissingFieldsAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: MissingField[];
  onComplete: (filledData: Record<string, unknown>) => void;
  extractedFieldsCount: number;
  totalFieldsCount: number;
}

export function MissingFieldsAssistant({
  isOpen,
  onClose,
  missingFields,
  onComplete,
  extractedFieldsCount,
}: MissingFieldsAssistantProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [filledData, setFilledData] = useState<Record<string, unknown>>({});
  const [skippedFields, setSkippedFields] = useState<Set<string>>(new Set());

  const currentField = missingFields[currentStep];
  const progress = ((currentStep + 1) / missingFields.length) * 100;
  const completedFields = Object.keys(filledData).length;

  const handleFieldChange = (value: unknown) => {
    setFilledData((prev) => ({
      ...prev,
      [currentField.name]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < missingFields.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Fin de l'assistant
      onComplete(filledData);
      onClose();
    }
  };

  const handleSkip = () => {
    setSkippedFields((prev) => new Set(prev).add(currentField.name));
    handleNext();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onComplete(filledData);
    onClose();
  };

  if (!currentField) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Assistant de Remplissage
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {extractedFieldsCount} champs remplis automatiquement,{" "}
            {missingFields.length} champs à compléter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentStep + 1} / {missingFields.length}
              </span>
              <span className="font-medium text-blue-600">
                {completedFields} réponses
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Catégorie actuelle */}
          {currentField.category && (
            <Badge variant="outline" className="text-sm">
              {currentField.category}
            </Badge>
          )}

          {/* Question */}
          <div className="space-y-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Label className="text-lg font-medium text-blue-900">
                  {currentField.label}
                  {currentField.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                {currentField.description && (
                  <p className="text-sm text-blue-700">
                    {currentField.description}
                  </p>
                )}
              </div>
            </div>

            {/* Champ de saisie */}
            <div className="space-y-2">
              {currentField.type === "text" && (
                <Input
                  value={String(filledData[currentField.name] || "")}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  placeholder="Votre réponse..."
                  className="bg-white"
                  autoFocus
                />
              )}

              {currentField.type === "textarea" && (
                <Textarea
                  value={String(filledData[currentField.name] || "")}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  placeholder="Votre réponse..."
                  className="bg-white min-h-[100px]"
                  autoFocus
                />
              )}

              {currentField.type === "number" && (
                <Input
                  type="number"
                  value={String(filledData[currentField.name] || "")}
                  onChange={(e) =>
                    handleFieldChange(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="Entrez un nombre..."
                  className="bg-white"
                  autoFocus
                />
              )}

              {currentField.type === "select" && currentField.options && (
                <Select
                  value={String(filledData[currentField.name] || "")}
                  onValueChange={handleFieldChange}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Sélectionnez une option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentField.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Passer
              </Button>

              {currentStep < missingFields.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    currentField.required && !filledData[currentField.name]
                  }
                  className="gap-2"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Terminer
                </Button>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{completedFields} complétés</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span>{skippedFields.size} ignorés</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{missingFields.length - currentStep - 1} restants</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
