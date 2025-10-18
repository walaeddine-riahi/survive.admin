"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect } from "@/components/user-select";
import { User } from "@/components/user-select";
import { Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export type SmsFormData = {
  to: string[]; // Tableau d'IDs des utilisateurs destinataires
  recipientPhones?: string[]; // Tableau de numéros de téléphone des destinataires
  body: string;
};

export default function SmsComposeForm({
  onSubmit,
  onCancel,
  simulationId,
}: {
  onSubmit: (data: SmsFormData) => void;
  onCancel: () => void;
  simulationId?: string;
}) {
  const { data: session } = useSession();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<SmsFormData>({
    to: [],
    recipientPhones: [],
    body: "",
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
  }, [session, simulationId]);

  // Mettre à jour les données du formulaire quand des utilisateurs sont sélectionnés
  useEffect(() => {
    const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));
    setFormData((prev) => ({
      ...prev,
      to: selectedUsers.map((u) => u.id),
      recipientPhones: selectedUsers.map((u) => u.phone || ""),
    }));
  }, [selectedUserIds, users]);

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      body: e.target.value,
    }));
  };

  // Gérer la sélection multiple d'utilisateurs
  const handleUserSelect = (values: string | string[]) => {
    // S'assurer d'avoir toujours un tableau
    const selectedValues = Array.isArray(values) ? values : [values];
    setSelectedUserIds(selectedValues);
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Destinataires</Label>
        <div className="w-full">
          <UserSelect
            multiple
            value={selectedUserIds}
            onValueChange={handleUserSelect}
            placeholder="Sélectionner un ou plusieurs destinataires..."
            className="w-full"
            users={users}
          />
        </div>
        {formData.recipientPhones && formData.recipientPhones.length > 0 && (
          <div className="space-y-1 mt-2">
            {formData.recipientPhones.map((phone, index) => (
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
        <Label htmlFor="body">Corps du message</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={handleBodyChange}
          placeholder="Saisissez votre message..."
          required
          rows={5}
          disabled={selectedUserIds.length === 0}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Envoyer SMS</Button>
      </div>
    </form>
  );
}
