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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Download,
  MoreHorizontal,
  Plus,
  Printer,
  QrCode,
  Search,
  Share2,
  User,
} from "lucide-react";

// Données d'exemple pour les rapports
const reports = [
  {
    id: "RPT-2025-001",
    title: "Rapport d'activité mensuel - Avril 2025",
    type: "activite",
    status: "publie",
    author: {
      name: "Emma Martin",
      email: "emma.martin@example.com",
      avatar: "/avatars/01.png",
    },
    created: "2025-05-05",
    format: "pdf",
    downloads: 45,
    shared: true,
  },
  {
    id: "RPT-2025-002",
    title: "Rapport financier Q1 2025",
    type: "financier",
    status: "publie",
    author: {
      name: "Thomas Durant",
      email: "thomas.durant@example.com",
      avatar: "/avatars/02.png",
    },
    created: "2025-04-15",
    format: "pdf",
    downloads: 72,
    shared: true,
  },
  {
    id: "RPT-2025-003",
    title: "Analyse des incidents critiques - Q1 2025",
    type: "technique",
    status: "brouillon",
    author: {
      name: "Sophie Bernard",
      email: "sophie.bernard@example.com",
      avatar: "/avatars/03.png",
    },
    created: "2025-05-10",
    format: "excel",
    downloads: 0,
    shared: false,
  },
  {
    id: "RPT-2025-004",
    title: "Rapport de performance des équipes",
    type: "rh",
    status: "publie",
    author: {
      name: "Julie Leroy",
      email: "julie.leroy@example.com",
      avatar: "/avatars/05.png",
    },
    created: "2025-04-28",
    format: "pdf",
    downloads: 32,
    shared: true,
  },
  {
    id: "RPT-2025-005",
    title: "État des lieux des projets en cours",
    type: "projet",
    status: "brouillon",
    author: {
      name: "Lucas Dupont",
      email: "lucas.dupont@example.com",
      avatar: "/avatars/04.png",
    },
    created: "2025-05-12",
    format: "word",
    downloads: 0,
    shared: false,
  },
  {
    id: "RPT-2025-006",
    title: "Rapport de satisfaction client Q1 2025",
    type: "client",
    status: "publie",
    author: {
      name: "Marc Petit",
      email: "marc.petit@example.com",
      avatar: "/avatars/06.png",
    },
    created: "2025-04-20",
    format: "pdf",
    downloads: 56,
    shared: true,
  },
  {
    id: "RPT-2025-007",
    title: "Analyse des ventes par région",
    type: "financier",
    status: "publie",
    author: {
      name: "Emma Martin",
      email: "emma.martin@example.com",
      avatar: "/avatars/01.png",
    },
    created: "2025-05-02",
    format: "pdf",
    downloads: 38,
    shared: true,
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "publie":
      return (
        <Badge variant="default" className="bg-green-500">
          Publié
        </Badge>
      );
    case "brouillon":
      return <Badge variant="secondary">Brouillon</Badge>;
    case "archive":
      return <Badge variant="outline">Archivé</Badge>;
    default:
      return <Badge variant="outline">Non défini</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "financier":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Financier
        </Badge>
      );
    case "technique":
      return (
        <Badge
          variant="outline"
          className="bg-orange-500/10 text-orange-500 border-orange-500/20"
        >
          Technique
        </Badge>
      );
    case "rh":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-500 border-purple-500/20"
        >
          Ressources Humaines
        </Badge>
      );
    case "projet":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 border-green-500/20"
        >
          Projet
        </Badge>
      );
    case "client":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        >
          Client
        </Badge>
      );
    case "activite":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
        >
          Activité
        </Badge>
      );
    default:
      return <Badge variant="outline">Autre</Badge>;
  }
};

const getFormatBadge = (format: string) => {
  switch (format) {
    case "pdf":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20"
        >
          PDF
        </Badge>
      );
    case "excel":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 border-green-500/20"
        >
          Excel
        </Badge>
      );
    case "word":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Word
        </Badge>
      );
    default:
      return <Badge variant="outline">Autre</Badge>;
  }
};

export default function ReportPage() {
  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des rapports</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nouveau rapport
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
                value="published"
                className="data-[state=active]:bg-background"
              >
                Publiés
              </TabsTrigger>
              <TabsTrigger
                value="drafts"
                className="data-[state=active]:bg-background"
              >
                Brouillons
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="data-[state=active]:bg-background"
              >
                Archivés
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8 w-[200px] md:w-[250px] bg-background border-input"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[150px] bg-background border-input">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="financier">Financier</SelectItem>
                  <SelectItem value="technique">Technique</SelectItem>
                  <SelectItem value="rh">Ressources Humaines</SelectItem>
                  <SelectItem value="projet">Projet</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="activite">Activité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Tous les rapports</CardTitle>
                    <CardDescription>
                      Liste complète des rapports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Type
                      </TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Format
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Auteur
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Créé le
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs">
                          {report.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {report.title}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getTypeIcon(report.type)}
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getFormatBadge(report.format)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage
                                src={report.author.avatar}
                                alt={report.author.name}
                              />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:block">
                              <p className="text-sm font-medium">
                                {report.author.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(report.created)}</span>
                          </div>
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
                              <DropdownMenuItem>Visualiser</DropdownMenuItem>
                              <DropdownMenuItem>Modifier</DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Download className="h-4 w-4" /> Télécharger
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" /> Générer QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Share2 className="h-4 w-4" /> Partager
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Printer className="h-4 w-4" /> Imprimer
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

          <TabsContent value="published" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Rapports publiés</CardTitle>
                <CardDescription>Rapports finalisés et publiés</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contenu pour les rapports publiés.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Brouillons</CardTitle>
                <CardDescription>
                  Rapports en cours d'élaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contenu pour les brouillons de rapports.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archived" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Rapports archivés</CardTitle>
                <CardDescription>Anciens rapports archivés</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contenu pour les rapports archivés.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
