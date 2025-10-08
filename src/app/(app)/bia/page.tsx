import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllProcesses } from "@/actions/bia/process-actions";
import { PlusCircle, Search, Filter, BarChart2 } from "lucide-react";
import Link from "next/link";
import { ImpactAnalysisButton } from "@/components/bia/impact-analysis-button";

// Définir le type Process pour correspondre à ce qui est retourné par l'API
type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default async function BIAPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = searchParams.search as string || '';
  const criticality = searchParams.criticality as string || 'all';
  
  // Récupérer les processus
  const result = await getAllProcesses();
  
  if (!result.success) {
    console.error('Error fetching processes:', result.error);
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">Erreur lors du chargement des processus: {result.error}</p>
      </div>
    );
  }
  
  // S'assurer que result.data est défini et est un tableau
  const processes: Process[] = Array.isArray(result.data) ? result.data : [];
  
  // Filtrer les processus en fonction des paramètres de recherche
  const filteredProcesses = processes.filter((process) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = !search || 
      process.name.toLowerCase().includes(searchTerm) ||
      (process.department && process.department.toLowerCase().includes(searchTerm));
    
    const matchesCriticality = criticality === 'all' || process.criticality === criticality;
    
    return matchesSearch && matchesCriticality;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Impact Analysis</h1>
          <p className="text-muted-foreground">
            Gérez vos processus d'analyse d'impact métier
          </p>
        </div>
        <Link href="/bia/processes/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau processus
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Processus BIA</CardTitle>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un processus..."
                  className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                  defaultValue={search}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select name="criticality" defaultValue={criticality}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par criticité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les criticités</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="outline">
                  Appliquer
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredProcesses.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Criticité</TableHead>
                    <TableHead>RTO</TableHead>
                    <TableHead>Dernière mise à jour</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">
                        <Link 
                          href={`/bia/processes/${process.id}`}
                          className="hover:underline"
                        >
                          {process.name}
                        </Link>
                      </TableCell>
                      <TableCell>{process.department}</TableCell>
                      <TableCell>{process.location}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          process.criticality === 'critical' ? 'bg-red-100 text-red-800' :
                          process.criticality === 'high' ? 'bg-orange-100 text-orange-800' :
                          process.criticality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {process.criticality === 'critical' ? 'Critique' :
                           process.criticality === 'high' ? 'Élevé' :
                           process.criticality === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                      </TableCell>
                      <TableCell>{process.rto}h</TableCell>
                      <TableCell>
                        {new Date(process.updatedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <ImpactAnalysisButton processData={process} />
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/bia/processes/${process.id}`}>
                              Modifier
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Aucun processus trouvé</h3>
              <p className="text-muted-foreground mt-2">
                {search || criticality !== 'all' 
                  ? 'Aucun processus ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier processus BIA.'}
              </p>
              {!search && criticality === 'all' && (
                <Button className="mt-4" asChild>
                  <Link href="/bia/processes/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer un processus
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
