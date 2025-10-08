"use client";

import { PageContainer } from "@/components/layout/page-container";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Filter } from "lucide-react";

// Données de test pour les rapports
const reports = [
  {
    id: "REP-001",
    title: "Rapport mensuel des incidents",
    date: "2024-03-15",
    status: "Complété",
    type: "Mensuel",
    author: "John Doe",
  },
  {
    id: "REP-002",
    title: "Analyse des incidents critiques",
    date: "2024-03-10",
    status: "En cours",
    type: "Analyse",
    author: "Jane Smith",
  },
  {
    id: "REP-003",
    title: "Rapport de sécurité Q1",
    date: "2024-03-01",
    status: "Complété",
    type: "Trimestriel",
    author: "Mike Johnson",
  },
];

export default function IncidentReportsPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Rapports d'Incidents
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Gérez et consultez tous les rapports d'incidents
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>Tous les rapports</DropdownMenuItem>
              <DropdownMenuItem>Complétés</DropdownMenuItem>
              <DropdownMenuItem>En cours</DropdownMenuItem>
              <DropdownMenuItem>Mensuels</DropdownMenuItem>
              <DropdownMenuItem>Trimestriels</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            Nouveau Rapport
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Liste des Rapports</CardTitle>
          <CardDescription>
            Consultez et gérez tous les rapports d'incidents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Auteur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{report.title}</span>
                        <span className="text-sm text-muted-foreground md:hidden">
                          {report.date}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {report.date}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {report.type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "Complété"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {report.author}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
