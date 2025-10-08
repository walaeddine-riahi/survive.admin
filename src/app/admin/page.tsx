"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, User, CheckCircle, XCircle, MoreHorizontal, Clock, Settings, Users } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Données d'exemple pour les utilisateurs
const users = [
  {
    id: "USR-001",
    name: "Emma Martin",
    email: "emma.martin@example.com",
    avatar: "/avatars/01.png",
    role: "admin",
    status: "active",
    lastActive: "En ligne",
    createdAt: "15 Jan 2025",
    teams: ["Marketing"],
  },
  {
    id: "USR-002",
    name: "Thomas Durant",
    email: "thomas.durant@example.com",
    avatar: "/avatars/02.png",
    role: "admin",
    status: "active",
    lastActive: "Il y a 5 minutes",
    createdAt: "3 Fév 2025",
    teams: ["Développement"],
  },
  {
    id: "USR-003",
    name: "Sophie Bernard",
    email: "sophie.bernard@example.com",
    avatar: "/avatars/03.png",
    role: "user",
    status: "active",
    lastActive: "Il y a 1 heure",
    createdAt: "20 Mar 2025",
    teams: ["Design"],
  },
  {
    id: "USR-004",
    name: "Lucas Dupont",
    email: "lucas.dupont@example.com",
    avatar: "/avatars/04.png",
    role: "user",
    status: "inactive",
    lastActive: "Il y a 2 jours",
    createdAt: "5 Avr 2025",
    teams: ["Support Client"],
  },
  {
    id: "USR-005",
    name: "Julie Leroy",
    email: "julie.leroy@example.com",
    avatar: "/avatars/05.png",
    role: "user",
    status: "active",
    lastActive: "Il y a 30 minutes",
    createdAt: "12 Mai 2025",
    teams: ["Ventes"],
  },
  {
    id: "USR-006",
    name: "Marc Petit",
    email: "marc.petit@example.com",
    avatar: "/avatars/06.png",
    role: "user",
    status: "pending",
    lastActive: "Jamais connecté",
    createdAt: "16 Mai 2025",
    teams: ["Développement"],
  },
]

// Données d'exemple pour les statistiques
const stats = [
  {
    title: "Total utilisateurs",
    value: "256",
    icon: Users,
  },
  {
    title: "Utilisateurs actifs",
    value: "224",
    icon: CheckCircle,
  },
  {
    title: "Utilisateurs inactifs",
    value: "32",
    icon: XCircle,
  },
  {
    title: "Nouveaux utilisateurs (mois)",
    value: "18",
    icon: Clock,
  },
]

// Données d'exemple pour les logs d'activité
const activityLogs = [
  {
    id: "LOG-001",
    user: "Emma Martin",
    action: "A modifié les permissions du rôle 'Manager'",
    timestamp: "Aujourd'hui à 14:32",
  },
  {
    id: "LOG-002",
    user: "Système",
    action: "Sauvegarde automatique de la base de données",
    timestamp: "Aujourd'hui à 12:00",
  },
  {
    id: "LOG-003",
    user: "Thomas Durant",
    action: "A désactivé le compte de 'Robert Blanc'",
    timestamp: "Aujourd'hui à 10:45",
  },
  {
    id: "LOG-004",
    user: "Julie Leroy",
    action: "A changé les paramètres du système de notification",
    timestamp: "Hier à 16:12",
  },
  {
    id: "LOG-005",
    user: "Système",
    action: "Mise à jour du système vers la version 2.1.5",
    timestamp: "Hier à 03:00",
  },
]

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return <Badge className="bg-primary">Admin</Badge>
    case 'superadmin':
      return <Badge className="bg-purple-600">Super Admin</Badge>
    case 'user':
      return <Badge variant="outline">Utilisateur</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Actif</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactif</Badge>
    case 'pending':
      return <Badge className="bg-yellow-500">En attente</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function AdminPage() {
  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background dark">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Administration</h1>
          <Button>
            <Settings className="mr-2 h-4 w-4" /> Paramètres
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
            <TabsTrigger value="logs">Logs d activité</TabsTrigger>
            <TabsTrigger value="settings">Paramètres système</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>
                      Gérez les utilisateurs et leurs droits d accès
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Rechercher un utilisateur..."
                        className="pl-8 w-full md:w-[250px]"
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actifs</SelectItem>
                        <SelectItem value="inactive">Inactifs</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <User className="mr-2 h-4 w-4" /> Ajouter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="hidden md:table-cell">Dernière activité</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {user.lastActive}
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
                              <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                              <DropdownMenuItem>Modifier le rôle</DropdownMenuItem>
                              <DropdownMenuItem>Réinitialiser le mot de passe</DropdownMenuItem>
                              <DropdownMenuItem>{user.status === "active" ? "Désactiver" : "Activer"}</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
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
          
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des rôles et permissions</CardTitle>
                <CardDescription>Définissez les rôles et leurs permissions associées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Super Administrateur</h3>
                          <p className="text-sm text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Modifier</Button>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Administrateur</h3>
                          <p className="text-sm text-muted-foreground">Accès à la plupart des fonctionnalités administratives</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Modifier</Button>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Manager</h3>
                          <p className="text-sm text-muted-foreground">Gestion d équipe et accès limité aux fonctionnalités admin</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Modifier</Button>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Utilisateur</h3>
                          <p className="text-sm text-muted-foreground">Accès standard aux fonctionnalités de base</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Modifier</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs d activité</CardTitle>
                <CardDescription>Journal des activités système et administratives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 rounded-md border p-4">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.user}</p>
                        <p className="text-sm text-muted-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres système</CardTitle>
                <CardDescription>Configuration générale du système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Paramètres généraux</h3>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Mode maintenance</h4>
                          <p className="text-sm text-muted-foreground">Mettre le site en mode maintenance</p>
                        </div>
                        <Button variant="outline">Désactivé</Button>
                      </div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Inscription utilisateur</h4>
                          <p className="text-sm text-muted-foreground">Autoriser les nouvelles inscriptions</p>
                        </div>
                        <Button variant="outline">Activé</Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Sécurité</h3>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Authentification à deux facteurs</h4>
                          <p className="text-sm text-muted-foreground">Rendre l authentification 2FA obligatoire</p>
                        </div>
                        <Button variant="outline">Optionnel</Button>
                      </div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Expiration des mots de passe</h4>
                          <p className="text-sm text-muted-foreground">Forcer le changement de mot de passe périodiquement</p>
                        </div>
                        <Button variant="outline">90 jours</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
