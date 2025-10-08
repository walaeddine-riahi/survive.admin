"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useToast } from "@/components/ui/use-toast";
import { UserForm } from "@/components/user-form";
import { Edit, MoreHorizontal, Plus, Search, Trash2, User, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface UserProfile {
  avatar: string | null;
  phone: string | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
  profile: UserProfile;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
  phone?: string;
  password?: string;
  avatar?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (data: UserFormData) => {
    try {
      console.log('Creating user with data:', data);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        
        // Handle duplicate email error specifically
        if (responseData.code === 'EMAIL_EXISTS') {
          throw new Error(
            `Un utilisateur avec l'email "${responseData.existingEmail}" existe déjà.`
          );
        }
        
        throw new Error(
          responseData.error || 
          responseData.message || 
          `Erreur HTTP: ${response.status} ${response.statusText}`
        );
      }

      await fetchUsers();
      setIsFormOpen(false);
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès.",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      await fetchUsers();
      setIsFormOpen(false);
      setSelectedUser(null);
      toast({
        title: "Utilisateur modifié",
        description: "L'utilisateur a été modifié avec succès.",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers();
      setSelectedUsers(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(userId);
        return newSelection;
      });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedUsers.size} utilisateurs sélectionnés ?`)) {
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      await fetchUsers();
      setSelectedUsers(new Set());
      
      toast({
        title: "Succès",
        description: `${data.deletedCount} utilisateur(s) supprimé(s) avec succès.`,
      });
    } catch (error) {
      console.error("Error deleting users:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression des utilisateurs.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.firstName?.toLowerCase() || "").includes(searchLower) ||
      (user.lastName?.toLowerCase() || "").includes(searchLower) ||
      (user.email?.toLowerCase() || "").includes(searchLower) ||
      (user.role?.toLowerCase() || "").includes(searchLower)
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
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouvel utilisateur
          </Button>
        </div>

        <Card className="bg-card border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle>Utilisateurs</CardTitle>
                  <CardDescription>
                    {filteredUsers.length} utilisateur
                    {filteredUsers.length !== 1 ? "s" : ""} trouvé
                    {filteredUsers.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                {selectedUsers.size > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="gap-2"
                  >
                    <Trash className="h-4 w-4" />
                    Supprimer ({selectedUsers.size})
                  </Button>
                )}
              </div>
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
          </CardHeader>
          <CardContent className="px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    className={selectedUsers.has(user.id) ? 'bg-gray-50' : ''}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.profile?.avatar || undefined}
                          />
                          <AvatarFallback>
                            {user.firstName?.[0] || ""}
                            {user.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.profile?.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role === "ADMIN"
                          ? "Administrateur"
                          : "Utilisateur"}
                      </Badge>
                    </TableCell>
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
                              setSelectedUser(user);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Supprimer
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
      </div>

      <UserForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        initialData={
          selectedUser
            ? {
                firstName: selectedUser.firstName || "",
                lastName: selectedUser.lastName || "",
                email: selectedUser.email || "",
                role: selectedUser.role || "USER",
                phone: selectedUser.profile?.phone || "",
                avatar: selectedUser.profile?.avatar || "",
              }
            : undefined
        }
      />
    </div>
  );
}
