"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  File as FileIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { uploadBiaReport } from "@/actions/bia/upload-report-actions";

interface FileUploadProps {
  onUploadComplete?: (reportId: string) => void;
}

export function BiaFileUpload({ onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Vérifier le type de fichier
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error(
        "Type de fichier non supporté. Veuillez sélectionner un fichier PDF ou Word."
      );
      return;
    }

    // Vérifier la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      toast.error("Le fichier est trop volumineux. Taille maximum : 50MB");
      return;
    }

    setFile(selectedFile);

    // Auto-remplir le nom si vide
    if (!formData.name) {
      setFormData((prev) => ({
        ...prev,
        name: selectedFile.name.replace(/\.[^/.]+$/, ""),
      }));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Veuillez saisir un nom pour le rapport");
      return;
    }

    setUploading(true);

    try {
      // Créer FormData pour l'upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("name", formData.name);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("tags", formData.tags);

      const result = await uploadBiaReport(uploadFormData);

      if (result.success) {
        toast.success("Fichier uploadé et traité avec succès !");

        // Réinitialiser le formulaire
        setFile(null);
        setFormData({
          name: "",
          description: "",
          category: "",
          tags: "",
        });

        // Reset input file
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        // Callback si fourni
        if (onUploadComplete && result.data?.id) {
          onUploadComplete(result.data.id);
        }
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'upload du fichier");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FileText className="h-8 w-8 text-muted-foreground" />;

    if (file.type === "application/pdf") {
      return <FileIcon className="h-8 w-8 text-red-500" />;
    } else if (file.type.includes("word")) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }

    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Télécharger un Rapport BIA
        </CardTitle>
        <CardDescription>
          Uploadez vos rapports PDF ou Word existants pour les stocker et les
          analyser dans le système BIA
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Zone d'upload */}
        <div className="space-y-4">
          <Label htmlFor="file-upload">Fichier de rapport</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  Changer le fichier
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Cliquez pour sélectionner un fichier
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Formats supportés : PDF, Word (DOCX, DOC) • Taille max :
                    50MB
                  </p>
                </div>
              </div>
            )}

            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              aria-label="Upload BIA report file"
              title="Sélectionner un fichier de rapport"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
          </div>
        </div>

        {/* Informations du rapport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du rapport *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Rapport BIA Q3 2024"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="mensuel">Rapport mensuel</SelectItem>
                <SelectItem value="trimestriel">Rapport trimestriel</SelectItem>
                <SelectItem value="annuel">Rapport annuel</SelectItem>
                <SelectItem value="incident">Post-incident</SelectItem>
                <SelectItem value="exercice">Exercice BCP</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Décrivez le contenu et l'objectif de ce rapport..."
            rows={3}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, tags: e.target.value }))
            }
            placeholder="Ex: audit, IT, processus critiques"
            disabled={uploading}
          />
          {formData.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags.split(",").map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Les fichiers seront automatiquement traités et indexés
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !formData.name.trim() || uploading}
            className="min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Télécharger
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
