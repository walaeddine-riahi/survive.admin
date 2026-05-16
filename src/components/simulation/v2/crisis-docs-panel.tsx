"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen, Search, FileText, Phone, AlertTriangle,
  MessageSquare, Shield, Settings2, Radio, ChevronRight,
  Pin, Star, X, Clock, ChevronDown, ExternalLink,
} from "lucide-react";
import {
  getDocs, getDocContent, searchDocs,
  trackDocOpen, trackDocClose,
} from "@/actions/simulation/crisis-docs-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = any; type DocFull = any; type Section = any; type Contact = any;

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PCA:           { label: "PCA",           icon: Shield,       color: "#185FA5", bg: "#E6F1FB" },
  DRP:           { label: "PRI / DRP",     icon: Settings2,    color: "#534AB7", bg: "#EEEDFE" },
  PROCEDURE:     { label: "Procédure",     icon: FileText,     color: "#0F6E56", bg: "#E1F5EE" },
  ANNUAIRE:      { label: "Annuaire",      icon: Phone,        color: "#854F0B", bg: "#FAEEDA" },
  REFERENCE:     { label: "Référence",     icon: BookOpen,     color: "#993556", bg: "#FBEAF0" },
  COMMUNICATION: { label: "Communication", icon: MessageSquare,color: "#3B6D11", bg: "#EAF3DE" },
  FICHE_REFLEXE: { label: "Fiche réflexe", icon: AlertTriangle,color: "#A32D2D", bg: "#FCEBEB" },
  OT_PROCEDURE:  { label: "Procédure OT",  icon: Radio,        color: "#854F0B", bg: "#FAEEDA" },
};

// ─── Contact card ─────────────────────────────────────────────────────────────
function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-xl">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold">
        {contact.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{contact.name}</p>
        <p className="text-xs text-muted-foreground">{contact.role}</p>
        {contact.notes && <p className="text-xs text-muted-foreground italic">{contact.notes}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-mono font-medium">{contact.phone}</p>
        {contact.email && <p className="text-xs text-muted-foreground">{contact.email}</p>}
        <Badge className="text-xs mt-0.5" variant={contact.priority === "primary" ? "default" : "outline"}>
          {contact.availability}
        </Badge>
      </div>
    </div>
  );
}

// ─── Document reader ──────────────────────────────────────────────────────────
function DocReader({ doc, onClose, consultationId }: {
  doc: DocFull;
  onClose: () => void;
  consultationId?: string;
}) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [viewedSections, setViewedSections] = useState<string[]>([]);
  const sections: Section[] = doc.sections || [];
  const contacts: Contact[] = doc.contacts || [];
  const cat = CAT_CONFIG[doc.category] || CAT_CONFIG.REFERENCE;
  const Icon = cat.icon;

  // Parse markdown to simple HTML-like structure
  function renderMarkdown(text: string) {
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold mt-4 mb-2 text-foreground border-b pb-1">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("- [ ] ")) return (
          <div key={i} className="flex items-start gap-2 py-0.5">
            <div className="w-4 h-4 border-2 rounded mt-0.5 flex-shrink-0" />
            <span className="text-sm">{line.slice(6)}</span>
          </div>
        );
        if (line.startsWith("- ")) return (
          <div key={i} className="flex items-start gap-2 py-0.5 pl-2">
            <span className="text-muted-foreground mt-1.5 flex-shrink-0">•</span>
            <span className="text-sm" dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </div>
        );
        if (line.startsWith("✅ ")) return <p key={i} className="text-sm py-0.5 text-green-700 font-medium">✅ {line.slice(3)}</p>;
        if (line.startsWith("❌ ")) return <p key={i} className="text-sm py-0.5 text-red-700 font-medium">❌ {line.slice(3)}</p>;
        if (line.startsWith("⚠️ ")) return (
          <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 my-2 text-sm text-amber-800">
            {line}
          </div>
        );
        if (line.startsWith("---")) return <hr key={i} className="my-3" />;
        if (!line.trim()) return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
      });
  }

  function trackSection(sectionId: string) {
    if (!viewedSections.includes(sectionId)) {
      setViewedSections(prev => [...prev, sectionId]);
    }
    setActiveSectionId(activeSectionId === sectionId ? null : sectionId);
  }

  // Track sections on close
  useEffect(() => {
    return () => {
      if (consultationId && viewedSections.length > 0) {
        trackDocClose(consultationId, viewedSections);
      }
    };
  }, [consultationId, viewedSections]);

  return (
    <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0">
      {/* Header */}
      <div className="flex items-start gap-3 p-5 border-b">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cat.bg }}>
          <Icon className="h-5 w-5" style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <DialogTitle className="text-base">{doc.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge className="text-xs" style={{ background: cat.bg, color: cat.color }}>{cat.label}</Badge>
            {doc.isCritical && (
              <Badge className="text-xs bg-red-100 text-red-700">📌 Document critique</Badge>
            )}
            <span className="text-xs text-muted-foreground">v{doc.version || "1.0"}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Contacts (annuaire) */}
        {contacts.length > 0 && (
          <div className="p-5 border-b space-y-2">
            <p className="text-sm font-semibold mb-3">Contacts prioritaires</p>
            {contacts.map((c: Contact, i: number) => <ContactCard key={i} contact={c} />)}
          </div>
        )}

        {/* Sections */}
        {sections.length > 0 && (
          <div className="p-5 border-b space-y-2">
            <p className="text-sm font-semibold mb-3">Sections</p>
            {sections.map((s: Section) => (
              <div key={s.id} className={`border rounded-xl overflow-hidden ${
                s.isKeyProcedure ? "border-blue-200" : "border-border"
              }`}>
                <button
                  onClick={() => trackSection(s.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30">
                  {s.isKeyProcedure && (
                    <Star className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm font-medium">{s.title}</span>
                  {viewedSections.includes(s.id) && (
                    <span className="text-xs text-green-600">✓ Lu</span>
                  )}
                  {activeSectionId === s.id
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>
                {activeSectionId === s.id && (
                  <div className="px-4 pb-4 border-t space-y-1 pt-3">
                    {renderMarkdown(s.content)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Full content */}
        {doc.content && (
          <div className="p-5 space-y-1">
            {renderMarkdown(doc.content)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground">
          {viewedSections.length} section(s) lue(s) sur {sections.length}
          {consultationId && <span className="ml-2 text-green-600">✓ Consultation enregistrée</span>}
        </p>
        <Button size="sm" variant="outline" onClick={onClose}>Fermer</Button>
      </div>
    </DialogContent>
  );
}

// ─── Doc list card ────────────────────────────────────────────────────────────
function DocCard({ doc, onOpen }: { doc: Doc; onOpen: (doc: Doc) => void }) {
  const cat = CAT_CONFIG[doc.category] || CAT_CONFIG.REFERENCE;
  const Icon = cat.icon;

  return (
    <button
      onClick={() => onOpen(doc)}
      className={`w-full flex items-start gap-3 p-3 border rounded-xl text-left hover:shadow-sm transition-all ${
        doc.isCritical ? "border-l-4 border-red-300" : "border-border"
      }`}
      style={doc.isCritical ? { borderLeftColor: "#A32D2D" } : {}}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cat.bg }}>
        <Icon className="h-4 w-4" style={{ color: cat.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          {doc.isPinned && <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />}
          {doc.isCritical && <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />}
          <span className="text-sm font-medium">{doc.title}</span>
        </div>
        {doc.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge className="text-xs" style={{ background: cat.bg, color: cat.color }}>{cat.label}</Badge>
          {doc.tags?.slice(0, 2).map((t: string) => (
            <span key={t} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
          {doc.consultationCount > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {doc.consultationCount}× consulté
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
    </button>
  );
}

// ─── Main documentation panel ─────────────────────────────────────────────────
export default function CrisisDocsPanel({
  simulationId,
  sessionId,
  participant,
  compact = false,
}: {
  simulationId: string;
  sessionId: string;
  participant: { id: string; displayName: string; role: string };
  compact?: boolean;
}) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [openDoc, setOpenDoc] = useState<DocFull | null>(null);
  const [consultationId, setConsultationId] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await getDocs(simulationId, participant.role);
      if (r.success && r.data) setDocs(r.data as Doc[]);
      setLoading(false);
    };
    load();
  }, [simulationId, participant.role]);

  const handleSearch = useCallback(async (q: string) => {
    setSearch(q);
    if (!q.trim()) {
      const r = await getDocs(simulationId, participant.role);
      if (r.success && r.data) setDocs(r.data as Doc[]);
      return;
    }
    startTransition(async () => {
      const r = await searchDocs(simulationId, q, participant.role);
      if (r.success && r.data) setDocs(r.data as Doc[]);
    });
  }, [simulationId, participant.role]);

  async function handleOpenDoc(doc: Doc) {
    // Load full content
    const r = await getDocContent(doc.id);
    if (!r.success || !r.data) { toast.error("Erreur chargement document"); return; }
    setOpenDoc(r.data as DocFull);

    // Track consultation
    const tc = await trackDocOpen({
      documentId: doc.id,
      sessionId,
      participantId: participant.id,
      participantName: participant.displayName,
      participantRole: participant.role,
      searchQuery: search || undefined,
    });
    if (tc.success) setConsultationId(tc.consultationId);
  }

  function handleCloseDoc() {
    setOpenDoc(null);
    setConsultationId(undefined);
    // Refresh doc list to update consultation count
    getDocs(simulationId, participant.role).then(r => {
      if (r.success && r.data) setDocs(r.data as Doc[]);
    });
  }

  // Categories present in docs
  const presentCategories = [...new Set(docs.map(d => d.category))];

  const filtered = docs.filter(d => {
    const matchesCat = activeCategory === "ALL" || d.category === activeCategory;
    return matchesCat;
  });

  const criticalDocs = docs.filter(d => d.isCritical);
  const pinnedDocs = filtered.filter(d => d.isPinned);
  const otherDocs = filtered.filter(d => !d.isPinned);

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "min-h-0"} bg-background`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Documentation de crise</p>
          <p className="text-xs text-muted-foreground">
            {docs.length} document(s)
            {criticalDocs.length > 0 && (
              <span className="text-red-500 ml-1">· {criticalDocs.length} critique(s)</span>
            )}
          </p>
        </div>
      </div>

      {/* Critical docs alert */}
      {criticalDocs.length > 0 && !search && activeCategory === "ALL" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100 flex-shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">
            Documents critiques à consulter pendant l'exercice :
            <span className="font-semibold"> {criticalDocs.map(d => d.title).join(", ")}</span>
          </p>
        </div>
      )}

      {/* Search */}
      <div className="px-3 py-2 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-xs"
            placeholder="Rechercher dans la documentation..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => handleSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      {!search && (
        <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto flex-shrink-0">
          <button onClick={() => setActiveCategory("ALL")}
            className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all ${
              activeCategory === "ALL" ? "bg-gray-800 text-white font-medium" : "text-muted-foreground hover:bg-muted"
            }`}>
            Tout ({docs.length})
          </button>
          {presentCategories.map(cat => {
            const cfg = CAT_CONFIG[cat];
            const count = docs.filter(d => d.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all ${
                  activeCategory === cat ? "font-semibold text-white" : "text-muted-foreground hover:bg-muted"
                }`}
                style={activeCategory === cat ? { background: cfg?.color } : {}}>
                {cfg?.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Chargement des documents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">{search ? `Aucun résultat pour "${search}"` : "Aucun document disponible"}</p>
          </div>
        ) : (
          <>
            {pinnedDocs.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 flex items-center gap-1">
                  <Pin className="h-3 w-3" /> Épinglés
                </p>
                {pinnedDocs.map(d => <DocCard key={d.id} doc={d} onOpen={handleOpenDoc} />)}
                {otherDocs.length > 0 && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mt-3">
                    Tous les documents
                  </p>
                )}
              </>
            )}
            {otherDocs.map(d => <DocCard key={d.id} doc={d} onOpen={handleOpenDoc} />)}
          </>
        )}
      </div>

      {/* Document reader dialog */}
      {openDoc && (
        <Dialog open onOpenChange={handleCloseDoc}>
          <DocReader doc={openDoc} onClose={handleCloseDoc} consultationId={consultationId} />
        </Dialog>
      )}
    </div>
  );
}
