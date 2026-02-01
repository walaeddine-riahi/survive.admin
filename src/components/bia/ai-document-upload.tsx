"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIDocumentUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDataExtracted: (data: any) => void;
  disabled?: boolean;
}

export function AIDocumentUpload({
  onDataExtracted,
  disabled,
}: AIDocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "analyzing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (disabled) return;

      const file = acceptedFiles[0];
      setFileName(file.name);
      setUploading(true);
      setStatus("uploading");
      setError(null);

      try {
        // Créer FormData avec le fichier
        const formData = new FormData();
        formData.append("file", file);

        // Upload vers l'API
        setStatus("analyzing");
        const response = await fetch("/api/bia/analyze-document", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || errorData.details || "Erreur lors de l'analyse"
          );
        }

        const result = await response.json();

        if (result.success && result.data) {
          setStatus("success");
          setTimeout(() => {
            onDataExtracted(result.data);
          }, 1000);
        } else {
          throw new Error("Aucune donnée extraite");
        }
      } catch (err) {
        console.error("Erreur upload:", err);
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de l'analyse du document"
        );
      } finally {
        setUploading(false);
      }
    },
    [disabled, onDataExtracted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled: disabled || uploading,
  });

  const resetUpload = () => {
    setStatus("idle");
    setError(null);
    setFileName(null);
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Remplissage Automatique avec IA
                <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Azure OpenAI
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Uploadez un document (PDF, Word, Excel) décrivant votre
                processus et l&apos;IA remplira automatiquement le formulaire
              </p>
            </div>

            {status === "idle" && (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-all duration-200
                  ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">
                    Déposez le fichier ici...
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700 font-medium mb-1">
                      Glissez-déposez un fichier ou cliquez pour sélectionner
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, Word (.docx), Excel (.xlsx, .xls) - Max 10MB
                    </p>
                  </>
                )}
              </div>
            )}

            {status === "uploading" && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-blue-800 ml-2">
                  <strong>Upload en cours...</strong>
                  <br />
                  <span className="text-sm">{fileName}</span>
                </AlertDescription>
              </Alert>
            )}

            {status === "analyzing" && (
              <Alert className="bg-purple-50 border-purple-200">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <AlertDescription className="text-purple-800 ml-2">
                  <strong>Analyse avec Azure OpenAI...</strong>
                  <br />
                  <span className="text-sm">
                    Extraction des informations du document
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">
                  <strong>✨ Analyse terminée !</strong>
                  <br />
                  <span className="text-sm">
                    Le formulaire a été rempli automatiquement. Vérifiez et
                    ajustez si nécessaire.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">
                  <strong>Erreur</strong>
                  <br />
                  <span className="text-sm">{error}</span>
                </AlertDescription>
              </Alert>
            )}

            {(status === "success" || status === "error") && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetUpload}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Analyser un autre document
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
