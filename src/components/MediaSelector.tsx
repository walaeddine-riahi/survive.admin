"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  type: "image" | "video" | "document" | "other";
  extension: string;
  createdAt: string;
  modifiedAt: string;
}

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  mediaType?: "image" | "video" | "all";
  currentValue?: string;
}

export function MediaSelector({
  open,
  onOpenChange,
  onSelect,
  mediaType = "all",
  currentValue,
}: MediaSelectorProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>(currentValue || "");
  const [urlInput, setUrlInput] = useState(currentValue || "");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadFiles();
      setSelectedFile(currentValue || "");
      setUrlInput(currentValue || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentValue]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/media/list");
      const data = await response.json();

      let filteredFiles = data.files || [];

      // Filtrer par type si nécessaire
      if (mediaType !== "all") {
        filteredFiles = filteredFiles.filter(
          (file: MediaFile) => file.type === mediaType
        );
      }

      setFiles(filteredFiles);
    } catch (error) {
      console.error("Erreur lors du chargement des fichiers:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fichiers média",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "folder",
      mediaType === "image" ? "images" : mediaType === "video" ? "videos" : ""
    );

    try {
      setUploading(true);
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Fichier uploadé avec succès",
        });
        await loadFiles();
        setSelectedFile(data.file.url);
      } else {
        throw new Error(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'uploader le fichier",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = () => {
    onSelect(selectedFile || urlInput);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélectionner ou uploader un média</DialogTitle>
          <DialogDescription>
            Choisissez un fichier existant ou uploadez-en un nouveau
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
            <TabsTrigger value="url">URL externe</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button asChild disabled={uploading}>
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Uploader un fichier
                      </>
                    )}
                  </span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept={
                  mediaType === "image"
                    ? "image/*"
                    : mediaType === "video"
                    ? "video/*"
                    : "image/*,video/*"
                }
              />
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Upload className="h-12 w-12 mb-4" />
                  <p>Aucun fichier disponible</p>
                  <p className="text-sm">Uploadez votre premier fichier</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.path}
                      className={`relative cursor-pointer rounded-lg border-2 p-2 hover:border-primary transition-colors ${
                        selectedFile === file.url
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedFile(file.url)}
                    >
                      {selectedFile === file.url && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {file.type === "image" ? (
                        <div className="aspect-square relative mb-2 bg-muted rounded overflow-hidden">
                          {file.url.startsWith("/media/") ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={file.url}
                              alt={file.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-muted rounded mb-2">
                          {getFileIcon(file.type)}
                        </div>
                      )}

                      <div className="space-y-1">
                        <p
                          className="text-xs font-medium truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">URL du média</Label>
              <Input
                id="url-input"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setSelectedFile("");
                }}
              />
              <p className="text-sm text-muted-foreground">
                Entrez l&apos;URL complète d&apos;une image ou vidéo hébergée en
                ligne
              </p>
            </div>

            {urlInput && (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Aperçu :</p>
                {mediaType === "image" ||
                urlInput.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <div className="relative aspect-video bg-muted rounded overflow-hidden">
                    <Image
                      src={urlInput}
                      alt="Aperçu"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">{urlInput}</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSelect} disabled={!selectedFile && !urlInput}>
            Sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
