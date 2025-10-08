"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Plus, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const teamMembers = [
  {
    id: "1",
    name: "Emma Martin",
    email: "emma.martin@example.com",
    avatar: "/avatars/01.png",
    team: "Marketing",
    role: "Chef d'équipe",
    status: "active",
    lastActive: "Il y a 5 minutes",
  },
  {
    id: "2",
    name: "Thomas Durant",
    email: "thomas.durant@example.com",
    avatar: "/avatars/02.png",
    team: "Développement",
    role: "Chef d'équipe",
    status: "active",
    lastActive: "Il y a 1 heure",
  },
  {
    id: "3",
    name: "Sophie Bernard",
    email: "sophie.bernard@example.com",
    avatar: "/avatars/03.png",
    team: "Design",
    role: "Chef d'équipe",
    status: "inactive",
    lastActive: "Il y a 3 jours",
  },
  {
    id: "4",
    name: "Lucas Dupont",
    email: "lucas.dupont@example.com",
    avatar: "/avatars/04.png",
    team: "Support Client",
    role: "Membre",
    status: "active",
    lastActive: "Il y a 10 minutes",
  },
  {
    id: "5",
    name: "Julie Leroy",
    email: "julie.leroy@example.com",
    avatar: "/avatars/05.png",
    team: "Ventes",
    role: "Chef d'équipe",
    status: "active",
    lastActive: "En ligne",
  },
  {
    id: "6",
    name: "Marc Petit",
    email: "marc.petit@example.com",
    avatar: "/avatars/06.png",
    team: "Développement",
    role: "Membre",
    status: "active",
    lastActive: "Il y a 30 minutes",
  },
  {
    id: "7",
    name: "Laura Simon",
    email: "laura.simon@example.com",
    avatar: "/avatars/07.png",
    team: "Marketing",
    role: "Membre",
    status: "active",
    lastActive: "En ligne",
  },
  {
    id: "8",
    name: "Nicolas Moreau",
    email: "nicolas.moreau@example.com",
    avatar: "/avatars/08.png",
    team: "Design",
    role: "Membre",
    status: "inactive",
    lastActive: "Il y a 1 semaine",
  },
]

export default function TeamMemberPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Membres d'équipe</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                  Gérez les membres de vos équipes
                </CardDescription>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-8 w-full md:w-[250px]"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Toutes les équipes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les équipes</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="development">Développement</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="support">Support Client</SelectItem>
                      <SelectItem value="sales">Ventes</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Statut
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Tous</DropdownMenuItem>
                      <DropdownMenuItem>Actifs</DropdownMenuItem>
                      <DropdownMenuItem>Inactifs</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Équipe</TableHead>
                  <TableHead className="hidden md:table-cell">Rôle</TableHead>
                  <TableHead className="hidden md:table-cell">Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Dernière activité</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground hidden md:block">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{member.team}</TableCell>
                    <TableCell className="hidden md:table-cell">{member.role}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {member.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {member.lastActive}
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
                          <DropdownMenuItem>Changer d'équipe</DropdownMenuItem>
                          <DropdownMenuItem>Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row items-center justify-between border-t px-6 py-4">
            <div className="text-xs text-muted-foreground mb-4 md:mb-0">
              Affichage de <strong>8</strong> membres sur <strong>8</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled>
                Suivant
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
