"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect, User } from "@/components/user-select";
import { Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export type CallFormData = {
  to: string[]; // Tableau d'IDs des utilisateurs destinataires
  toPhones?: string[]; // Tableau de numéros de téléphone des destinataires
  notes: string;
  // optional sender info (added for handlers that forward sender)
  from?: string | null;
  fromPhone?: string | null;
};

export default function CallComposeForm({
  onSubmit,
  onCancel,
  simulationId,
  teamId,
}: {
  onSubmit: (data: CallFormData) => void;
  onCancel: () => void;
  simulationId?: string;
  teamId?: string | null;
}) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(
    []
  );

  // Gestion de la sélection multiple d'utilisateurs
  const handleRecipientChange = (values: string | string[]) => {
    // S'assurer d'avoir toujours un tableau
    const selectedValues = Array.isArray(values) ? values : [values];
    setSelectedRecipientIds(selectedValues);
  };

  const [formData, setFormData] = useState<CallFormData>({
    to: [],
    toPhones: [],
    notes: "",
  });

  // Charger la liste des utilisateurs assignés à la simulation
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Si simulationId est fourni, charger uniquement les participants de cette simulation
        const url = simulationId
          ? `/api/simulations/${simulationId}/participants`
          : "/api/users";

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          // Extraire les utilisateurs depuis les assignments si c'est une simulation
          const usersList =
            simulationId && Array.isArray(data)
              ? data
                  .filter(
                    (assignment: { user: User; teamId?: string | null }) =>
                      !teamId || assignment.teamId === teamId
                  )
                  .map((assignment: { user: User }) => assignment.user)
                  .filter(Boolean)
              : data;

          // Filtrer pour ne pas afficher l'utilisateur actuel dans la liste des destinataires
          const otherUsers = usersList.filter(
            (u: User) => u.id !== session?.user?.id
          );
          setUsers(otherUsers);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      }
    };

    if (session?.user?.id) {
      fetchUsers();
    }
  }, [session?.user?.id, simulationId, teamId]);

  // Mettre à jour les données du formulaire quand des destinataires sont sélectionnés
  useEffect(() => {
    const selectedUsers = users.filter((u) =>
      selectedRecipientIds.includes(u.id)
    );
    setFormData((prev) => ({
      ...prev,
      to: selectedUsers.map((u) => u.id),
      toPhones: selectedUsers.map((u) => u.phone || ""),
    }));
  }, [selectedRecipientIds, users]);

  // Préparer les données pour l'envoi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // S'assurer qu'il y a au moins un destinataire
    if (formData.to.length === 0) {
      return;
    }

    // Préparer les données pour chaque destinataire
    const formDataWithSender = {
      ...formData,
      from: session?.user?.id || "",
      fromPhone: session?.user?.phone || "",
    };

    onSubmit(formDataWithSender);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      notes: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Destinataires</Label>
        <div className="w-full">
          <UserSelect
            multiple
            value={selectedRecipientIds}
            onValueChange={handleRecipientChange}
            placeholder="Sélectionner un ou plusieurs destinataires..."
            users={users}
          />
        </div>
        {formData.toPhones && formData.toPhones.length > 0 && (
          <div className="space-y-1 mt-2">
            {formData.toPhones.map((phone, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-muted-foreground"
              >
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {phone || "Numéro non disponible"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={handleNotesChange}
          placeholder="Ajoutez des notes sur l'appel..."
          rows={5}
          disabled={selectedRecipientIds.length === 0}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={formData.to.length === 0}>
          Enregistrer l&apos;appel
        </Button>
      </div>
    </form>
  );
}
