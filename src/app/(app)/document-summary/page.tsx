"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/ui/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  FileUp,
  Loader2,
  CheckCircle2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function DocumentSummaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("");
  const [documentType, setDocumentType] = useState<"bia" | "standard">(
    "standard"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      if (!validTypes.includes(selectedFile.type)) {
        toast.error(
          "Type de fichier non supporté. Veuillez uploader un PDF ou Word."
        );
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Fichier trop volumineux (max 10 MB).");
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUploadAndSummarize = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await fetch("/api/document/summarize", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error("Erreur lors du traitement du fichier");
      }

      const data = await response.json();
      setSummary(data.summary);
      setEditedSummary(data.summary);
      setFileName(data.fileName);
      setAnalysisType(data.analysisType || "Résumé Standard");
      setDocumentType(data.documentType || "standard");

      const successMessage =
        data.documentType === "bia"
          ? "Analyse BIA critique générée avec succès"
          : "Résumé généré avec succès";
      toast.success(successMessage);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la génération du résumé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Header
        heading="Résumé de Document"
        text="Uploadez et analysez un document BIA ou un document standard"
      />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              Uploadez un document BIA (PDF/Word) pour générer une analyse
              critique détaillée.
            </p>
            <p className="text-xs italic">
              Les documents contenant des indicateurs BIA (RTO, MTPD, MBCO, ISO
              22301/22317, etc.) recevront une analyse critique structurée selon
              les standards BCM.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {/* Carte Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Uploader un fichier
            </CardTitle>
            <CardDescription>
              Supportés : PDF, Word (.docx, .doc). Taille max : 10 MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleUploadAndSummarize}
                disabled={!file || loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    Analyser
                  </>
                )}
              </Button>
            </div>

            {file && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✓ Fichier sélectionné : <strong>{fileName}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Carte Analyse */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {documentType === "bia"
                  ? "Analyse Critique BIA"
                  : "Résumé généré"}
              </CardTitle>
              <div className="space-y-1 mt-2">
                <p className="text-sm text-muted-foreground">
                  Fichier : {fileName}
                </p>
                {analysisType && (
                  <p className="text-xs italic text-muted-foreground">
                    Type : {analysisType}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="min-h-[70vh] max-h-[70vh] font-mono text-sm"
                    placeholder="Modifiez le contenu ici..."
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSummary(editedSummary);
                        setIsEditing(false);
                        toast.success("Modifications enregistrées");
                      }}
                      className="flex-1 gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </Button>
                    <Button
                      onClick={() => {
                        setEditedSummary(summary);
                        setIsEditing(false);
                      }}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none rounded-lg bg-slate-50 p-4 dark:prose-invert max-h-[70vh] overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {summary}
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditedSummary(summary);
                      setIsEditing(true);
                    }}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(summary);
                      toast.success(
                        documentType === "bia"
                          ? "Analyse copiée au presse-papiers"
                          : "Résumé copié au presse-papiers"
                      );
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Copier le contenu
                  </Button>
                  <Button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([summary], { type: "text/plain" });
                      element.href = URL.createObjectURL(file);
                      element.download = `${fileName.replace(
                        /\.[^/.]+$/,
                        ""
                      )}_${documentType === "bia" ? "analyse" : "resume"}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast.success("Fichier téléchargé");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Télécharger
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
