"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UserSelect, type User } from "@/components/user-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

type Simulation = {
  id: string;
  title: string;
  status?: string | null;
};

type TeamMember = {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    profile?: {
      avatar?: string | null;
    } | null;
  };
};

type Team = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  members: TeamMember[];
};

type TeamMemberRole = "LEADER" | "MEMBER";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [selectedSimulationId, setSelectedSimulationId] = useState("");
  const [simulationParticipants, setSimulationParticipants] = useState<User[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [memberRole, setMemberRole] = useState<TeamMemberRole>("MEMBER");

  const participantUsers = useMemo(() => {
    const sourceUsers = selectedSimulationId
      ? simulationParticipants
      : users.filter((user) => user.role !== "ADMIN");

    const uniqueUsers = new Map<string, User>();

    for (const user of sourceUsers) {
      if (user?.id && !uniqueUsers.has(user.id)) {
        uniqueUsers.set(user.id, user);
      }
    }

    return [...uniqueUsers.values()];
  }, [users, simulationParticipants, selectedSimulationId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [teamsResponse, usersResponse, simulationsResponse] =
        await Promise.all([
          fetch("/api/teams"),
          fetch("/api/users"),
          fetch("/api/simulations"),
        ]);

      if (!teamsResponse.ok) {
        throw new Error("Impossible de charger les équipes");
      }

      if (!usersResponse.ok) {
        throw new Error("Impossible de charger les utilisateurs");
      }

      if (!simulationsResponse.ok) {
        throw new Error("Impossible de charger les simulations");
      }

      const teamsData = (await teamsResponse.json()) as Team[];
      const usersData = (await usersResponse.json()) as User[];
      const simulationsData =
        (await simulationsResponse.json()) as Simulation[];

      setTeams(teamsData);
      setUsers(usersData);
      setSimulations(simulationsData);

      if (!selectedSimulationId && simulationsData.length > 0) {
        setSelectedSimulationId(simulationsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!selectedSimulationId) {
        setSimulationParticipants([]);
        return;
      }

      setParticipantsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/simulations/${selectedSimulationId}/participants`
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de charger les participants de la simulation"
          );
        }

        const data = (await response.json()) as Array<{
          user?: User;
        }>;

        setSimulationParticipants(
          data.map((assignment) => assignment.user).filter(Boolean) as User[]
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les participants"
        );
        setSimulationParticipants([]);
      } finally {
        setParticipantsLoading(false);
      }
    };

    void loadParticipants();
  }, [selectedSimulationId]);

  useEffect(() => {
    if (!teamId && teams.length > 0) {
      setTeamId(teams[0].id);
    }
  }, [teamId, teams]);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError("Le nom de l'équipe est requis.");
      return;
    }

    setSavingTeam(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Impossible de créer l'équipe");
      }

      setTeams((current) => [payload, ...current]);
      setTeamId(payload.id);
      setTeamName("");
      setTeamDescription("");
      setSuccess(`Équipe ${payload.name} créée avec succès.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de créer l'équipe"
      );
    } finally {
      setSavingTeam(false);
    }
  };

  const handleAssignParticipants = async () => {
    if (!teamId) {
      setError("Veuillez sélectionner une équipe.");
      return;
    }

    if (participantIds.length === 0) {
      setError("Veuillez sélectionner au moins un participant.");
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      const results = await Promise.all(
        participantIds.map(async (userId) => {
          const response = await fetch("/api/team-members", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              teamId,
              role: memberRole,
            }),
          });

          const payload = await response.json();

          if (!response.ok) {
            throw new Error(
              payload?.error || "Impossible d'affecter le participant"
            );
          }

          return payload;
        })
      );

      setParticipantIds([]);
      setSuccess(`${results.length} participant(s) affecté(s) avec succès.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'affecter les participants"
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(`Retirer ${memberName} de cette équipe ?`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/team-members?id=${memberId}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Impossible de retirer le membre");
      }

      setSuccess(`${memberName} a été retiré de l'équipe.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de retirer le membre"
      );
    }
  };

  const selectedTeam = teams.find((team) => team.id === teamId);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
              <Users className="h-3 w-3" /> Administration des équipes
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Répartition & Équipes
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Gérez les structures opérationnelles et affectez les participants.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Retour Administration
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-cyan-100 shadow-sm">
            <CardHeader>
              <CardTitle>Créer une équipe</CardTitle>
              <CardDescription>
                Ajoutez une nouvelle équipe pour la simulation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Nom de l'équipe</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex: Équipe rouge"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-description">Description</Label>
                <Textarea
                  id="team-description"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Décrivez le rôle ou l'objectif de l'équipe"
                />
              </div>
              <Button
                onClick={handleCreateTeam}
                disabled={savingTeam || loading}
                className="w-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] rounded-[12px] h-12 font-bold uppercase tracking-widest"
              >
                {savingTeam ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Créer l'équipe
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-cyan-100 shadow-sm">
            <CardHeader>
              <CardTitle>Affecter des participants</CardTitle>
              <CardDescription>
                Sélectionnez une simulation pour charger ses participants, puis
                assignez-les à une équipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="simulation-select">Simulation</Label>
                <Select
                  value={selectedSimulationId}
                  onValueChange={setSelectedSimulationId}
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
                <p className="text-xs text-slate-500">
                  {selectedSimulationId
                    ? participantsLoading
                      ? "Chargement des participants de la simulation..."
                      : `${participantUsers.length} participant(s) disponible(s) dans cette simulation`
                    : `${participantUsers.length} utilisateur(s) disponible(s)`}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="team-select">Équipe</Label>
                  <Select value={teamId} onValueChange={setTeamId}>
                    <SelectTrigger id="team-select">
                      <SelectValue placeholder="Sélectionner une équipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTeam && (
                    <p className="text-xs text-slate-500">
                      {selectedTeam.description || "Aucune description"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-role">Rôle dans l'équipe</Label>
                  <Select
                    value={memberRole}
                    onValueChange={(value) =>
                      setMemberRole(value as TeamMemberRole)
                    }
                  >
                    <SelectTrigger id="member-role">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Membre</SelectItem>
                      <SelectItem value="LEADER">Responsable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <UserSelect
                  value={participantIds}
                  onValueChange={(value) =>
                    setParticipantIds(Array.isArray(value) ? value : [value])
                  }
                  users={participantUsers}
                  multiple
                  placeholder={
                    selectedSimulationId
                      ? "Sélectionner des participants de la simulation"
                      : "Sélectionner des participants"
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleAssignParticipants}
                  disabled={assigning || loading || teams.length === 0}
                  className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] rounded-[12px] px-8 h-12 font-bold uppercase tracking-widest"
                >
                  {assigning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Affecter les participants
                </Button>
                <p className="text-sm text-[var(--text-muted)] font-medium">
                  {participantIds.length} participant(s) sélectionné(s)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-cyan-100 shadow-sm">
          <CardHeader>
            <CardTitle>Équipes existantes</CardTitle>
            <CardDescription>
              Consultez les membres déjà rattachés à chaque équipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement des
                équipes...
              </div>
            ) : teams.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">
                Aucune équipe disponible.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">
                          {team.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {team.description || "Aucune description"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {team.members.length} membre(s)
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {team.members.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          Aucun participant affecté.
                        </p>
                      ) : (
                        team.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg bg-[var(--bg-tertiary)]/30 px-3 py-2 text-sm"
                          >
                            <div>
                              <div className="font-medium text-[var(--text-primary)]">
                                {member.user.firstName || member.user.lastName
                                  ? `${member.user.firstName || ""} ${
                                      member.user.lastName || ""
                                    }`.trim()
                                  : member.user.email}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {member.user.email}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[var(--accent)] text-white border-none">
                                {member.role}
                              </Badge>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                  const memberName =
                                    member.user.firstName ||
                                    member.user.lastName
                                      ? `${member.user.firstName || ""} ${
                                          member.user.lastName || ""
                                        }`.trim()
                                      : member.user.email;
                                  void handleRemoveMember(
                                    member.id,
                                    memberName
                                  );
                                }}
                                aria-label={`Retirer ${member.user.email} de l'équipe`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
