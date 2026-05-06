"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, User } from "lucide-react";

type Simulation = {
  id: string;
  title: string;
  status?: string | null;
};

type Scenario = {
  id: string;
  name: string;
  description?: string | null;
};

type Communication = {
  id: string;
  type: string;
  content: string;
  subject?: string | null;
  createdAt: string;
  sender?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  recipient?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  payload?: {
    reportId?: string;
    originalFileName?: string;
    [key: string]: unknown;
  } | null;
};

export default function AdminParticipantCommunicationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [simulationId, setSimulationId] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioId, setScenarioId] = useState("");
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [simulationsLoading, setSimulationsLoading] = useState(true);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<{
    reportId: string;
    fileName: string;
    url: string;
  } | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterParticipant, setFilterParticipant] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [sortBy, setSortBy] = useState<
    "type" | "participant" | "team" | "date"
  >("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredComms = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    let list = communications.filter((comm) => {
      const fullText = [
        comm.sender?.firstName,
        comm.sender?.lastName,
        comm.sender?.email,
        comm.content,
        comm.subject,
        comm.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !lowerSearch || fullText.includes(lowerSearch);
      const matchesType =
        !filterType || comm.type?.toLowerCase() === filterType.toLowerCase();
      const participantName = `${comm.sender?.firstName || ""} ${
        comm.sender?.lastName || ""
      }`.trim();
      const matchesParticipant =
        !filterParticipant ||
        comm.sender?.email?.toLowerCase() === filterParticipant.toLowerCase() ||
        participantName.toLowerCase() === filterParticipant.toLowerCase();
      const matchesTeam =
        !filterTeam ||
        comm.recipient?.email?.toLowerCase() === filterTeam.toLowerCase();

      return matchesSearch && matchesType && matchesParticipant && matchesTeam;
    });

    list = list.sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortBy === "type")
        return (a.type || "").localeCompare(b.type || "") * mult;
      if (sortBy === "participant") {
        const pa = `${a.sender?.firstName || ""} ${a.sender?.lastName || ""}`
          .trim()
          .toLowerCase();
        const pb = `${b.sender?.firstName || ""} ${b.sender?.lastName || ""}`
          .trim()
          .toLowerCase();
        return pa.localeCompare(pb) * mult;
      }
      if (sortBy === "team") {
        const ta = a.recipient?.email || "";
        const tb = b.recipient?.email || "";
        return ta.localeCompare(tb) * mult;
      }
      // date
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        mult
      );
    });

    return list;
  }, [
    communications,
    search,
    filterType,
    filterParticipant,
    filterTeam,
    sortBy,
    sortDir,
  ]);

  const loadScenarios = useCallback(async (simId: string) => {
    if (!simId.trim()) {
      setScenarios([]);
      setScenarioId("");
      return;
    }
    setScenariosLoading(true);
    try {
      const res = await fetch(`/api/simulations/${simId}/scenarios`);
      if (!res.ok) {
        throw new Error("Impossible de charger les scenarios.");
      }
      const data = (await res.json()) as Scenario[];
      setScenarios(data);
      if (data.length > 0) {
        setScenarioId(data[0].id);
      }
    } catch (err) {
      console.error("Error loading scenarios:", err);
      setScenarios([]);
      setScenarioId("");
    } finally {
      setScenariosLoading(false);
    }
  }, []);

  const loadSimulations = useCallback(async () => {
    setSimulationsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/simulations");
      if (!res.ok) {
        throw new Error("Impossible de charger les simulations.");
      }
      const data = (await res.json()) as Simulation[];
      setSimulations(data);
      if (!simulationId && data.length > 0) {
        setSimulationId(data[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du chargement des simulations."
      );
    } finally {
      setSimulationsLoading(false);
    }
  }, [simulationId]);

  const fetchCommunications = useCallback(async () => {
    if (!simulationId.trim()) {
      setError("Veuillez sélectionner une simulation.");
      return;
    }
    setError(null);
    try {
      const res = await fetch(
        `/api/simulations/${simulationId}/communications`
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Impossible de charger les communications.");
      }
      const data = (await res.json()) as Communication[];
      setCommunications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la récupération des communications."
      );
    }
  }, [simulationId]);

  useEffect(() => {
    void loadSimulations();
  }, [loadSimulations]);

  useEffect(() => {
    if (simulationId.trim()) {
      void loadScenarios(simulationId);
    }
  }, [simulationId, loadScenarios]);

  useEffect(() => {
    if (simulationId.trim() && scenarioId.trim()) {
      fetchCommunications();
    }
  }, [simulationId, scenarioId, fetchCommunications]);

  const renderBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t === "report") return <Badge className="bg-[var(--accent)] text-white border-none">Rapport</Badge>;
    if (t === "email") return <Badge className="bg-[#6366F1] text-white border-none">Email</Badge>;
    if (t === "sms") return <Badge className="bg-[#3B82F6] text-white border-none">SMS</Badge>;
    if (t === "call") return <Badge className="bg-[#10B981] text-white border-none">Appel</Badge>;
    if (t === "alert") return <Badge className="bg-[#F59E0B] text-white border-none">Alerte</Badge>;
    return <Badge variant="outline" className="border-[var(--border)]">{type}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Suivi des communications participants
          </h1>
          <p className="text-sm text-muted-foreground">
            Voir ce que chaque participant envoie, et visualiser les rapports
            PDF
          </p>
        </div>
        <Link href="/admin" className="text-sm font-bold text-[var(--accent)] hover:underline">
          Retour Administration
        </Link>
      </div>

      <Card className="mb-4">
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="simulation-select">Simulation</Label>
              <Select
                value={simulationId}
                onValueChange={setSimulationId}
                disabled={simulationsLoading}
              >
                <SelectTrigger id="simulation-select">
                  <SelectValue placeholder="Sélectionner une simulation" />
                </SelectTrigger>
                <SelectContent>
                  {simulations.map((simulation) => (
                    <SelectItem key={simulation.id} value={simulation.id}>
                      {simulation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-select">Scénario</Label>
              <Select
                value={scenarioId}
                onValueChange={setScenarioId}
                disabled={scenariosLoading || !simulationId}
              >
                <SelectTrigger id="scenario-select">
                  <SelectValue placeholder="Sélectionner un scénario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche globale..."
              className="bg-[var(--bg-surface)] border-[var(--border)]"
            />
            <select
              aria-label="Filtrer par type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[var(--bg-surface)] border-[var(--border)] p-2 rounded-md text-sm text-[var(--text-primary)]"
            >
              <option value="">Tous les types</option>
              {[
                ...new Set(communications.map((c) => c.type).filter(Boolean)),
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrer par participant"
              value={filterParticipant}
              onChange={(e) => setFilterParticipant(e.target.value)}
              className="bg-[var(--bg-surface)] border-[var(--border)] p-2 rounded-md text-sm text-[var(--text-primary)]"
            >
              <option value="">Tous les participants</option>
              {[
                ...new Set(
                  communications
                    .map(
                      (c) =>
                        `${c.sender?.firstName || ""} ${
                          c.sender?.lastName || ""
                        }`.trim() ||
                        c.sender?.email ||
                        ""
                    )
                    .filter(Boolean)
                ),
              ].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrer par équipe"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="bg-[var(--bg-surface)] border-[var(--border)] p-2 rounded-md text-sm text-[var(--text-primary)]"
            >
              <option value="">Toutes les teams</option>
              {[
                ...new Set(
                  communications
                    .map((c) => c.recipient?.email || "")
                    .filter(Boolean)
                ),
              ].map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {communications.length} communication(s), {filteredComms.length}{" "}
              affichée(s)
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm">Trier par :</label>
              <select
                aria-label="Trier par"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "type" | "participant" | "team" | "date"
                  )
                }
                className="bg-[var(--bg-surface)] border-[var(--border)] p-2 rounded-md text-sm text-[var(--text-primary)]"
              >
                <option value="date">Date</option>
                <option value="type">Type</option>
                <option value="participant">Participant</option>
                <option value="team">Team</option>
              </select>
              <button
                onClick={() =>
                  setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="bg-[var(--bg-surface)] border-[var(--border)] p-2 rounded-md text-sm text-[var(--text-primary)]"
              >
                {sortDir === "asc" ? "asc" : "desc"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Contenu</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComms.map((comm) => (
              <TableRow key={comm.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>
                      {comm.sender?.firstName || "-"}{" "}
                      {comm.sender?.lastName || ""}
                      {comm.sender?.email ? ` (${comm.sender.email})` : ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{renderBadge(comm.type)}</TableCell>
                <TableCell>{comm.subject || "-"}</TableCell>
                <TableCell className="max-w-[250px] truncate">
                  {comm.content || "-"}
                </TableCell>
                <TableCell>
                  {new Date(comm.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {comm.type.toLowerCase() === "report" &&
                  comm.payload?.reportId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!comm.payload?.reportId) {
                          return;
                        }
                        setSelectedReport({
                          reportId: comm.payload.reportId,
                          fileName:
                            comm.payload.originalFileName || "Rapport PDF",
                          url: `/api/bia/download/${comm.payload.reportId}?inline=true`,
                        });
                      }}
                    >
                      Voir PDF
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-5xl h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-sm font-semibold">
                {selectedReport.fileName}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedReport(null)}
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <iframe
              src={selectedReport.url}
              className="w-full h-full"
              title={selectedReport.fileName}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
