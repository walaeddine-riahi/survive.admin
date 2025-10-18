"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect, User } from "@/components/user-select";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export type EmailFormData = {
  to: string[]; // Tableau d'IDs des utilisateurs destinataires
  toEmails?: string[]; // Tableau d'emails des destinataires
  subject: string;
  body: string;
};

export default function EmailComposeForm({
  onSubmit,
  onCancel,
  simulationId,
}: {
  onSubmit: (data: EmailFormData) => void | Promise<void>;
  onCancel: () => void;
  simulationId?: string;
}) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(
    []
  );
  const [formData, setFormData] = useState<EmailFormData>({
    to: [],
    toEmails: [],
    subject: "",
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
          const usersList = simulationId && Array.isArray(data)
            ? data.map((assignment: { user: User }) => assignment.user).filter(Boolean)
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

  // Mettre à jour les données du formulaire quand des destinataires sont sélectionnés
  useEffect(() => {
    const selectedUsers = users.filter((u) =>
      selectedRecipientIds.includes(u.id)
    );
    setFormData((prev) => ({
      ...prev,
      to: selectedUsers.map((u) => u.id),
      toEmails: selectedUsers.map((u) => u.email || ""),
    }));
  }, [selectedRecipientIds, users]);

  // Gestion de la sélection multiple d'utilisateurs
  const handleRecipientChange = (values: string | string[]) => {
    // S'assurer d'avoir toujours un tableau
    const selectedValues = Array.isArray(values) ? values : [values];
    setSelectedRecipientIds(selectedValues);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // S'assurer que les emails des destinataires sont inclus
    const formDataWithEmails = {
      ...formData,
      toEmails: formData.toEmails || [],
    };
    onSubmit(formDataWithEmails);
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
        {formData.toEmails && formData.toEmails.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.toEmails.map((email, index) => (
              <div
                key={index}
                className="flex items-center bg-red-50 border-red-200 rounded-full px-3 py-1 text-sm"
              >
                <Mail className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                <span className="text-red-700">{email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Objet</Label>
        <Input
          id="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Corps du message</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={handleChange}
          required
          rows={10}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Envoyer
        </Button>
      </div>
    </form>
  );
}
