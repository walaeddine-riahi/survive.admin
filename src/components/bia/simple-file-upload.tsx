"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

// Composant d'alerte simple
function Alert({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}) {
  const baseClass = "p-4 rounded-lg border flex items-start gap-2";
  const variantClass =
    variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-blue-200 bg-blue-50 text-blue-800";

  return (
    <div className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </div>
  );
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}

interface UploadResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export function SimpleFileUpload({
  onUploadSuccess,
}: {
  onUploadSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.name) {
        // Suggérer un nom basé sur le fichier
        const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFormData((prev) => ({ ...prev, name: nameWithoutExtension }));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!formData.name) {
        const nameWithoutExtension = droppedFile.name.replace(/\.[^/.]+$/, "");
        setFormData((prev) => ({ ...prev, name: nameWithoutExtension }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !formData.name) {
      setResult({
        success: false,
        error: "Veuillez sélectionner un fichier et saisir un nom",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append("file", file);
      submitFormData.append("name", formData.name);
      submitFormData.append("description", formData.description);
      submitFormData.append("category", formData.category);
      submitFormData.append("tags", formData.tags);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/bia/simple-upload", {
        method: "POST",
        body: submitFormData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();
      setResult(result);

      if (result.success) {
        // Réinitialiser le formulaire
        setFile(null);
        setFormData({ name: "", description: "", category: "", tags: "" });
        onUploadSuccess?.();
      }
    } catch (err) {
      console.error("Upload error:", err);
      setResult({
        success: false,
        error: "Erreur lors de l'upload du fichier",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    return validTypes.includes(file.type);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Rapport BIA
        </CardTitle>
        <CardDescription>
          Importez vos rapports PDF, Word ou texte pour les intégrer à votre
          système BIA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone de drop */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            file
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <FileText className="h-5 w-5" />
              <span>{file.name}</span>
              <span className="text-sm text-gray-500">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p>
                Glissez-déposez votre fichier ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500">
                Formats supportés: PDF, Word (.docx, .doc), Texte (.txt)
              </p>
            </div>
          )}

          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.txt"
            className="mt-4"
          />
        </div>

        {file && !isValidFileType(file) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Type de fichier non supporté. Utilisez PDF, Word ou Texte.
            </AlertDescription>
          </Alert>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du rapport *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nom descriptif du rapport"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description optionnelle du rapport"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="ex: Audit, Analyse"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="ex: urgent, review, 2025"
              />
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload en cours...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? result.message : result.error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={
              !file ||
              !formData.name ||
              uploading ||
              !isValidFileType(file || new File([], ""))
            }
            className="w-full"
          >
            {uploading ? "Upload en cours..." : "Uploader le Rapport"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
