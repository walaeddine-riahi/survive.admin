"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  Plus,
  FileText,
  Eye,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Loader2,
  StickyNote,
} from "lucide-react";
import {
  getInstructorNotes,
  updateInstructorNotes,
  appendInstructorNote,
} from "@/actions/simulation/instructor-notes-actions";

interface InstructorNotesPanelProps {
  sessionId: string;
  sessionTitle?: string;
}

type NoteCategory = "observation" | "decision" | "improvement" | "alert" | "general";

const CATEGORY_CONFIG = {
  observation: { label: "Observation", icon: Eye, color: "#3b82f6", bg: "#3b82f615" },
  decision: { label: "Décision", icon: CheckCircle2, color: "#10b981", bg: "#10b98115" },
  improvement: { label: "Amélioration", icon: Lightbulb, color: "#f59e0b", bg: "#f59e0b15" },
  alert: { label: "Alerte", icon: AlertTriangle, color: "#ef4444", bg: "#ef444415" },
  general: { label: "Note", icon: StickyNote, color: "#8b5cf6", bg: "#8b5cf615" },
};

export default function InstructorNotesPanel({ 
  sessionId, 
  sessionTitle 
}: InstructorNotesPanelProps) {
  const [notes, setNotes] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingFull, setIsEditingFull] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load existing notes
  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    const result = await getInstructorNotes(sessionId);
    if (result.success && result.data) {
      setNotes(result.data.instructorNotes || "");
    }
    setIsLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Auto-save full notes
  const saveFullNotes = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    const result = await updateInstructorNotes(sessionId, notes);
    if (result.success) {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success("Notes sauvegardées");
    } else {
      toast.error(result.error || "Erreur lors de la sauvegarde");
    }
    setIsSaving(false);
  }, [sessionId, notes, hasUnsavedChanges]);

  // Add quick note with timestamp and category
  const handleAddQuickNote = async () => {
    if (!quickNote.trim()) {
      toast.error("Veuillez entrer une note");
      return;
    }

    setIsSaving(true);
    const result = await appendInstructorNote(sessionId, quickNote.trim(), selectedCategory);
    if (result.success) {
      // Reload notes to show the new entry
      await loadNotes();
      setQuickNote("");
      toast.success("Note ajoutée");
    } else {
      toast.error(result.error || "Erreur lors de l'ajout");
    }
    setIsSaving(false);
  };

  // Handle manual save
  const handleManualSave = async () => {
    setIsSaving(true);
    const result = await updateInstructorNotes(sessionId, notes);
    if (result.success) {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success("Notes sauvegardées avec succès");
    } else {
      toast.error(result.error || "Erreur lors de la sauvegarde");
    }
    setIsSaving(false);
  };

  // Clear all notes
  const handleClearNotes = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer toutes les notes ?")) return;
    
    setIsSaving(true);
    const result = await updateInstructorNotes(sessionId, "");
    if (result.success) {
      setNotes("");
      setHasUnsavedChanges(false);
      toast.success("Notes effacées");
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
    setIsSaving(false);
  };

  // Debounced auto-save
  useEffect(() => {
    if (!hasUnsavedChanges || !isEditingFull) return;
    
    const timer = setTimeout(() => {
      saveFullNotes();
    }, 2000);

    return () => clearTimeout(timer);
  }, [notes, hasUnsavedChanges, isEditingFull, saveFullNotes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-400">Chargement des notes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Notes de l&apos;Instructeur</h2>
            <p className="text-xs text-gray-500">
              {sessionTitle || `Session: ${sessionId}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[10px] text-gray-500">
              Dernière sauvegarde: {lastSaved.toLocaleTimeString("fr-FR")}
            </span>
          )}
          {hasUnsavedChanges && (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
              Non sauvegardé
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Note Entry */}
      <div className="bg-[#0e1726]/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-orange-500" />
          <Label className="text-sm font-bold text-gray-300">Ajouter une note rapide</Label>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const CatIcon = config.icon;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  isActive
                    ? "text-white"
                    : "bg-slate-950/40 text-gray-400 border-slate-800 hover:border-slate-700 hover:text-gray-300"
                }`}
                style={isActive ? {
                  backgroundColor: config.bg,
                  borderColor: config.color,
                  color: config.color,
                } : {}}
              >
                <CatIcon className="h-3.5 w-3.5" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Quick Note Input */}
        <div className="flex gap-3">
          <Input
            className="flex-1 h-10 text-sm bg-slate-950/40 border-slate-800/80 text-white rounded-xl focus-visible:ring-orange-500"
            placeholder="Écrivez votre note ici..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddQuickNote();
              }
            }}
          />
          <Button
            className="h-10 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl gap-2"
            onClick={handleAddQuickNote}
            disabled={isSaving || !quickNote.trim()}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Ajouter
          </Button>
        </div>
      </div>

      {/* Full Notes Editor */}
      <div className="bg-[#0e1726]/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-blue-400" />
            <Label className="text-sm font-bold text-gray-300">Éditeur de notes complet</Label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-slate-700 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg"
              onClick={() => setIsEditingFull(!isEditingFull)}
            >
              {isEditingFull ? "Verrouiller" : "Éditer"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-red-800/50 text-red-400 hover:bg-red-950/40 rounded-lg"
              onClick={handleClearNotes}
              disabled={isSaving || !notes}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Effacer
            </Button>
          </div>
        </div>

        <Textarea
          className={`min-h-[300px] text-sm bg-slate-950/40 border-slate-800/80 text-white rounded-xl resize-none ${
            isEditingFull ? "focus-visible:ring-orange-500" : "cursor-default"
          }`}
          placeholder="Notes de l'instructeur pour cette simulation...

Vous pouvez utiliser cet espace pour:
- Documenter les observations en temps réel
- Noter les points à améliorer
- Enregistrer les décisions importantes
- Préparer le débriefing

Les notes sont automatiquement sauvegardées."
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setHasUnsavedChanges(true);
          }}
          readOnly={!isEditingFull}
        />

        {isEditingFull && (
          <div className="flex justify-end gap-2">
            <Button
              className="h-9 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl gap-2"
              onClick={handleManualSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Sauvegarder
            </Button>
          </div>
        )}

        {/* Notes Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{notes.split("\n").filter(l => l.trim()).length} lignes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FileText className="h-3.5 w-3.5" />
            <span>{notes.length} caractères</span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-4">
        <p className="text-xs text-blue-300">
          💡 <strong>Conseil:</strong> Utilisez l&apos;ajout rapide pour noter des observations en temps réel pendant la simulation. 
          L&apos;éditeur complet permet de rédiger des notes plus détaillées pour le débriefing.
        </p>
      </div>
    </div>
  );
}
