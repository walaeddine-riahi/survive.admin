"use client";

import { TeamMemberForm } from "@/components/team-member-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Edit, MoreHorizontal, Plus, Search, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: {
      avatar: string | null;
    };
  };
  team: {
    id: string;
    name: string;
  };
}

interface TeamMemberFormData {
  userId: string;
  role: string;
  teamId: string;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case "LEADER":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Responsable
        </Badge>
      );
    case "MEMBER":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 border-green-500/20"
        >
          Membre
        </Badge>
      );
    case "VIEWER":
      return (
        <Badge
          variant="outline"
          className="bg-gray-500/10 text-gray-500 border-gray-500/20"
        >
          Observateur
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team-members");
      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }
      const data = await response.json();
      setTeamMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleCreateMember = async (data: TeamMemberFormData) => {
    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create team member");
      }

      await fetchTeamMembers();
      setIsFormOpen(false);
      toast({
        title: "Membre ajouté",
        description: "Le membre a été ajouté avec succès.",
      });
    } catch (error) {
      console.error("Error creating team member:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue l&apos;ajout du membre.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMember = async (data: TeamMemberFormData) => {
    if (!selectedMember) return;

    try {
      const response = await fetch(`/api/team-members/${selectedMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update team member");
      }

      await fetchTeamMembers();
      setIsFormOpen(false);
      setSelectedMember(null);
      toast({
        title: "Membre modifié",
        description: "Le membre a été modifié avec succès.",
      });
    } catch (error) {
      console.error("Error updating team member:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification du membre.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (
      !confirm("Êtes-vous sûr de vouloir retirer ce membre de l&apos;équipe ?")
    )
      return;

    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete team member");
      }

      await fetchTeamMembers();
      toast({
        title: "Membre retiré",
        description: "Le membre a été retiré de l&apos;équipe avec succès.",
      });
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors du retrait du membre de l&apos;équipe.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.user.firstName.toLowerCase().includes(searchLower) ||
      member.user.lastName.toLowerCase().includes(searchLower) ||
      member.user.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower) ||
      member.team.name.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Membres d&apos;équipe</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-background"
              >
                Tous
              </TabsTrigger>
              <TabsTrigger
                value="leaders"
                className="data-[state=active]:bg-background"
              >
                Responsables
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-background"
              >
                Membres
              </TabsTrigger>
              <TabsTrigger
                value="viewers"
                className="data-[state=active]:bg-background"
              >
                Observateurs
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8 w-[200px] md:w-[250px] bg-background border-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Tous les membres</CardTitle>
                    <CardDescription>
                      {filteredMembers.length} membre
                      {filteredMembers.length !== 1 ? "s" : ""} trouvé
                      {filteredMembers.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {member.user.profile.avatar ? (
                              <img
                                src={member.user.profile.avatar}
                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <User className="h-8 w-8 text-muted-foreground" />
                            )}
                            <span>
                              {member.user.firstName} {member.user.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{member.user.email}</TableCell>
                        <TableCell>{member.team.name}</TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() => handleDeleteMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" /> Retirer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaders" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Responsables</CardTitle>
                <CardDescription>
                  {
                    filteredMembers.filter((member) => member.role === "LEADER")
                      .length
                  }{" "}
                  responsable
                  {filteredMembers.filter((member) => member.role === "LEADER")
                    .length !== 1
                    ? "s"
                    : ""}{" "}
                  trouvé
                  {filteredMembers.filter((member) => member.role === "LEADER")
                    .length !== 1
                    ? "s"
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers
                      .filter((member) => member.role === "LEADER")
                      .map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.user.profile.avatar ? (
                                <img
                                  src={member.user.profile.avatar}
                                  alt={`${member.user.firstName} ${member.user.lastName}`}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <User className="h-8 w-8 text-muted-foreground" />
                              )}
                              <span>
                                {member.user.firstName} {member.user.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{member.user.email}</TableCell>
                          <TableCell>{member.team.name}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" /> Retirer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                  {
                    filteredMembers.filter((member) => member.role === "MEMBER")
                      .length
                  }{" "}
                  membre
                  {filteredMembers.filter((member) => member.role === "MEMBER")
                    .length !== 1
                    ? "s"
                    : ""}{" "}
                  trouvé
                  {filteredMembers.filter((member) => member.role === "MEMBER")
                    .length !== 1
                    ? "s"
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers
                      .filter((member) => member.role === "MEMBER")
                      .map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.user.profile.avatar ? (
                                <img
                                  src={member.user.profile.avatar}
                                  alt={`${member.user.firstName} ${member.user.lastName}`}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <User className="h-8 w-8 text-muted-foreground" />
                              )}
                              <span>
                                {member.user.firstName} {member.user.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{member.user.email}</TableCell>
                          <TableCell>{member.team.name}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" /> Retirer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viewers" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Observateurs</CardTitle>
                <CardDescription>
                  {
                    filteredMembers.filter((member) => member.role === "VIEWER")
                      .length
                  }{" "}
                  observateur
                  {filteredMembers.filter((member) => member.role === "VIEWER")
                    .length !== 1
                    ? "s"
                    : ""}{" "}
                  trouvé
                  {filteredMembers.filter((member) => member.role === "VIEWER")
                    .length !== 1
                    ? "s"
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers
                      .filter((member) => member.role === "VIEWER")
                      .map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.user.profile.avatar ? (
                                <img
                                  src={member.user.profile.avatar}
                                  alt={`${member.user.firstName} ${member.user.lastName}`}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <User className="h-8 w-8 text-muted-foreground" />
                              )}
                              <span>
                                {member.user.firstName} {member.user.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{member.user.email}</TableCell>
                          <TableCell>{member.team.name}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" /> Retirer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TeamMemberForm
        open={isFormOpen}
        onOpenChange={(open: boolean) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedMember(null);
          }
        }}
        onSubmit={selectedMember ? handleUpdateMember : handleCreateMember}
        initialData={
          selectedMember
            ? {
                userId: selectedMember.user.id,
                role: selectedMember.role,
                teamId: selectedMember.team.id,
              }
            : undefined
        }
      />
    </div>
  );
}
