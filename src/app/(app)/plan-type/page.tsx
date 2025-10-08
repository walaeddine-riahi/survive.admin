"use client";

import { PlanTypeForm } from "@/components/plan-type-form";
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
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PlanType {
  id: string;
  name: string;
  description: string | null;
}

interface PlanTypeFormData {
  name: string;
  description?: string;
}

export default function PlanTypePage() {
  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchPlanTypes = async () => {
    try {
      const response = await fetch("/api/plan-types");
      if (!response.ok) {
        throw new Error("Failed to fetch plan types");
      }
      const data = await response.json();
      setPlanTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanTypes();
  }, []);

  const handleCreatePlanType = async (data: PlanTypeFormData) => {
    try {
      const response = await fetch("/api/plan-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create plan type");
      }

      await fetchPlanTypes();
      setIsFormOpen(false);
      toast({
        title: "Type créé",
        description: "Le type a été créé avec succès.",
      });
    } catch (error) {
      console.error("Error creating plan type:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du type.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlanType = async (data: PlanTypeFormData) => {
    if (!selectedPlanType) return;

    try {
      const response = await fetch(`/api/plan-types/${selectedPlanType.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update plan type");
      }

      await fetchPlanTypes();
      setIsFormOpen(false);
      setSelectedPlanType(null);
      toast({
        title: "Type modifié",
        description: "Le type a été modifié avec succès.",
      });
    } catch (error) {
      console.error("Error updating plan type:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du type.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlanType = async (planTypeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce type ?")) return;

    try {
      const response = await fetch(`/api/plan-types/${planTypeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete plan type");
      }

      await fetchPlanTypes();
      toast({
        title: "Type supprimé",
        description: "Le type a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Error deleting plan type:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du type.",
        variant: "destructive",
      });
    }
  };

  const filteredPlanTypes = planTypes.filter((planType) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      planType.name.toLowerCase().includes(searchLower) ||
      planType.description?.toLowerCase().includes(searchLower) ||
      planType.id.toLowerCase().includes(searchLower)
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
          <h1 className="text-3xl font-bold">Types de plan</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau type
          </Button>
        </div>

        <Card className="bg-card border shadow-sm">
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Types de plan</CardTitle>
                <CardDescription>
                  {filteredPlanTypes.length} type
                  {filteredPlanTypes.length !== 1 ? "s" : ""} trouvé
                  {filteredPlanTypes.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
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
          </CardHeader>
          <CardContent className="px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlanTypes.map((planType) => (
                  <TableRow key={planType.id}>
                    <TableCell className="font-mono text-xs">
                      {planType.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {planType.name}
                    </TableCell>
                    <TableCell>{planType.description || "-"}</TableCell>
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
                              setSelectedPlanType(planType);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600"
                            onClick={() => handleDeletePlanType(planType.id)}
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

      <PlanTypeForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedPlanType(null);
          }
        }}
        onSubmit={
          selectedPlanType ? handleUpdatePlanType : handleCreatePlanType
        }
        initialData={
          selectedPlanType
            ? {
                name: selectedPlanType.name,
                description: selectedPlanType.description || "",
              }
            : undefined
        }
      />
    </div>
  );
}
