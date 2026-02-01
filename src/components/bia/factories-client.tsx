/**
 * Composant Client : Liste et Gestion des Usines
 *
 * Ce composant fournit une interface interactive pour :
 * - Afficher la liste des usines en mode grid/liste
 * - Rechercher et filtrer les usines
 * - Créer une nouvelle usine
 * - Modifier/Supprimer une usine
 * - Accéder à l'analyse consolidée
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Search,
  Plus,
  Grid3x3,
  List,
  MapPin,
  Users,
  FileText,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Power,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Type pour une usine avec statistiques (doit correspondre au type du serveur)
interface FactoryWithStats {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  isActive: boolean;
  criticalityLevel?: string | null;
  employeeCount?: number | null;
  _count: {
    processes: number;
    biaReports: number;
  };
  manager?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

interface FactoriesClientProps {
  factories: FactoryWithStats[];
}

export function FactoriesClient({ factories }: FactoriesClientProps) {
  const router = useRouter();

  // États
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterCriticality, setFilterCriticality] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // États pour la sélection et suppression
  const [selectedFactories, setSelectedFactories] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrage et recherche
  const filteredFactories = useMemo(() => {
    return factories.filter((factory) => {
      // Filtre de recherche
      const matchesSearch =
        searchQuery === "" ||
        factory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        factory.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        factory.city?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre de statut
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && factory.isActive) ||
        (filterStatus === "inactive" && !factory.isActive);

      // Filtre de criticité
      const matchesCriticality =
        filterCriticality === "all" ||
        factory.criticalityLevel === filterCriticality;

      return matchesSearch && matchesStatus && matchesCriticality;
    });
  }, [factories, searchQuery, filterStatus, filterCriticality]);

  // Navigation vers l'analyse d'une usine
  const handleViewAnalysis = (factoryId: string) => {
    router.push(`/bia/factories/${factoryId}/analysis`);
  };

  // Gestion de la sélection
  const toggleFactory = (factoryId: string) => {
    setSelectedFactories((prev) =>
      prev.includes(factoryId)
        ? prev.filter((id) => id !== factoryId)
        : [...prev, factoryId]
    );
  };

  const toggleAll = () => {
    if (selectedFactories.length === filteredFactories.length) {
      setSelectedFactories([]);
    } else {
      setSelectedFactories(filteredFactories.map((f) => f.id));
    }
  };

  // Suppression des usines
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/bia/factories/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ factoryIds: selectedFactories }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      const data = await response.json();
      toast.success(data.message || "Usines supprimées avec succès");
      setSelectedFactories([]);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression des usines");
    } finally {
      setIsDeleting(false);
    }
  };

  // Basculer le statut actif/inactif
  const handleToggleStatus = async (
    factoryId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch("/api/bia/factories/toggle-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ factoryId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du changement de statut");
      }

      const data = await response.json();
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du changement de statut");
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de filtres et actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une usine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as "all" | "active" | "inactive")
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="inactive">Inactives</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterCriticality}
            onValueChange={setFilterCriticality}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Criticité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="critique">Critique</SelectItem>
              <SelectItem value="élevé">Élevé</SelectItem>
              <SelectItem value="moyen">Moyen</SelectItem>
              <SelectItem value="faible">Faible</SelectItem>
            </SelectContent>
          </Select>

          {/* Boutons de vue */}
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Bouton créer */}
          <CreateFactoryDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
        </div>
      </div>

      {/* Barre d'actions pour la sélection et suppression */}
      {filteredFactories.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={
                selectedFactories.length === filteredFactories.length &&
                filteredFactories.length > 0
              }
              onCheckedChange={toggleAll}
              className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all duration-200"
            />
            <span className="text-sm font-medium text-slate-700">
              {selectedFactories.length === filteredFactories.length
                ? "Tout désélectionner"
                : "Sélectionner tout"}
            </span>
          </div>

          {selectedFactories.length > 0 && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm font-medium text-slate-600">
                {selectedFactories.length} usine
                {selectedFactories.length > 1 ? "s" : ""} sélectionnée
                {selectedFactories.length > 1 ? "s" : ""}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Résultats */}
      <div className="text-sm text-muted-foreground">
        {filteredFactories.length} usine
        {filteredFactories.length > 1 ? "s" : ""} trouvée
        {filteredFactories.length > 1 ? "s" : ""}
      </div>

      {/* Liste des usines */}
      {filteredFactories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune usine trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Aucune usine ne correspond à vos critères de recherche.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une usine
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFactories.map((factory) => (
            <FactoryCard
              key={factory.id}
              factory={factory}
              onViewAnalysis={handleViewAnalysis}
              isSelected={selectedFactories.includes(factory.id)}
              onToggleSelect={toggleFactory}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFactories.map((factory) => (
            <FactoryListItem
              key={factory.id}
              factory={factory}
              onViewAnalysis={handleViewAnalysis}
              isSelected={selectedFactories.includes(factory.id)}
              onToggleSelect={toggleFactory}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              {selectedFactories.length === 1
                ? "cette usine"
                : `ces ${selectedFactories.length} usines`}{" "}
              ?
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900 mb-2">
                  ⚠️ Cette action est irréversible
                </p>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  {factories
                    .filter((f) => selectedFactories.includes(f.id))
                    .map((factory) => (
                      <li key={factory.id}>
                        <span className="font-medium">{factory.name}</span>
                        <span className="text-red-600 ml-2">
                          ({factory._count.processes} processus,{" "}
                          {factory._count.biaReports} rapports)
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Carte d'usine (vue grille)
 */
function FactoryCard({
  factory,
  onViewAnalysis,
  isSelected,
  onToggleSelect,
  onToggleStatus,
}: {
  factory: FactoryWithStats;
  onViewAnalysis: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}) {
  const getCriticalityColor = (level?: string | null) => {
    switch (level) {
      case "critique":
        return "bg-red-500";
      case "élevé":
        return "bg-orange-500";
      case "moyen":
        return "bg-yellow-500";
      case "faible":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 border-2 rounded-xl ${
        isSelected ? "bg-blue-50 border-blue-300 shadow-md" : "border-slate-200"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(factory.id)}
              onClick={(e) => e.stopPropagation()}
              className={`h-5 w-5 rounded-md border-2 transition-all duration-200 ${
                isSelected
                  ? "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 scale-110"
                  : "border-slate-300"
              }`}
            />
            <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{factory.name}</CardTitle>
              <CardDescription className="text-xs">
                {factory.code}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {factory.isActive ? (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Localisation */}
        {factory.city && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>
              {factory.city}
              {factory.country && `, ${factory.country}`}
            </span>
          </div>
        )}

        {/* Criticité */}
        {factory.criticalityLevel && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${getCriticalityColor(
                  factory.criticalityLevel
                )}`}
              />
              <span className="text-sm capitalize">
                {factory.criticalityLevel}
              </span>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>{factory._count.processes} processus</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{factory._count.biaReports} rapports</span>
          </div>
        </div>

        {/* Employés */}
        {factory.employeeCount && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Users className="h-4 w-4" />
            <span>{factory.employeeCount} employés</span>
          </div>
        )}

        {/* Statut actif/inactif */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-2 border-slate-200 rounded-xl mb-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg transition-all duration-300 ${
                factory.isActive
                  ? "bg-green-100 shadow-sm shadow-green-500/20"
                  : "bg-slate-200"
              }`}
            >
              <Power
                className={`h-5 w-5 transition-colors duration-300 ${
                  factory.isActive ? "text-green-600" : "text-slate-500"
                }`}
              />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800 block">
                {factory.isActive ? "Usine active" : "Usine inactive"}
              </span>
              <span className="text-xs text-slate-500">
                {factory.isActive ? "En fonctionnement" : "Hors service"}
              </span>
            </div>
          </div>
          <Switch
            checked={factory.isActive}
            onCheckedChange={() => onToggleStatus(factory.id, factory.isActive)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onViewAnalysis(factory.id)}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyse
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Item d'usine (vue liste)
 */
function FactoryListItem({
  factory,
  onViewAnalysis,
  isSelected,
  onToggleSelect,
  onToggleStatus,
}: {
  factory: FactoryWithStats;
  onViewAnalysis: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}) {
  return (
    <Card
      className={`hover:bg-muted/50 transition-all duration-200 border-2 rounded-xl ${
        isSelected ? "bg-blue-50 border-blue-300 shadow-md" : "border-slate-200"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(factory.id)}
              onClick={(e) => e.stopPropagation()}
              className={`h-5 w-5 rounded-md border-2 transition-all duration-200 ${
                isSelected
                  ? "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 scale-110"
                  : "border-slate-300"
              }`}
            />
            <Building2 className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{factory.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {factory.code}
                </Badge>
                {factory.isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {factory.city && `${factory.city}, `}
                {factory._count.processes} processus •{" "}
                {factory._count.biaReports} rapports
                {factory.employeeCount &&
                  ` • ${factory.employeeCount} employés`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {factory.criticalityLevel && (
              <Badge variant="outline" className="capitalize">
                {factory.criticalityLevel}
              </Badge>
            )}
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  factory.isActive
                    ? "bg-green-100 shadow-sm shadow-green-500/20"
                    : "bg-slate-200"
                }`}
              >
                <Power
                  className={`h-4 w-4 transition-colors duration-300 ${
                    factory.isActive ? "text-green-600" : "text-slate-500"
                  }`}
                />
              </div>
              <Switch
                checked={factory.isActive}
                onCheckedChange={() =>
                  onToggleStatus(factory.id, factory.isActive)
                }
              />
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewAnalysis(factory.id)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyse
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dialog de création d'usine
 */
function CreateFactoryDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      description: formData.get("description") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
    };

    try {
      const response = await fetch("/api/bia/factories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'usine"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Usine
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une Nouvelle Usine</DialogTitle>
            <DialogDescription>
              Ajouter une nouvelle usine au système BIA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Usine de Production A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                placeholder="Ex: UPA"
                required
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Description de l'usine..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" name="city" placeholder="Paris" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input id="country" name="country" placeholder="France" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
