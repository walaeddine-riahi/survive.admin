"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect, User } from "@/components/user-select";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export type AlertFormData = {
  subject: string;
  message: string;
  sendToAll: boolean;
  recipients?: string[];
  recipientEmails?: string[];
};

export default function AlertComposeForm({
  onSubmit,
  onCancel,
  simulationId,
  teamId,
}: {
  onSubmit: (data: AlertFormData) => void;
  onCancel: () => void;
  isParticipant?: boolean;
  simulationId?: string;
  teamId?: string | null;
}) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(
    []
  );
  const [selectedRecipientEmails, setSelectedRecipientEmails] = useState<
    string[]
  >([]);

  const [formData, setFormData] = useState<AlertFormData>({
    subject: "",
    message: "",
    sendToAll: true,
    recipients: [],
    recipientEmails: [],
  });

  // Charger la liste des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const endpoint = simulationId
          ? `/api/simulations/${simulationId}/participants`
          : "/api/users";
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const allUsers = simulationId
            ? data
                .filter(
                  (assignment: { user: User; teamId?: string | null }) =>
                    !teamId || assignment.teamId === teamId
                )
                .map((assignment: { user: User }) => assignment.user)
            : data;
          // Filtrer pour ne pas afficher l'utilisateur actuel dans la liste des destinataires
          const otherUsers = allUsers.filter(
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      sendToAll: checked,
      recipients: checked ? [] : formData.recipients,
      recipientEmails: checked ? [] : formData.recipientEmails,
    }));

    if (checked) {
      setSelectedRecipientIds([]);
      setSelectedRecipientEmails([]);
    }
  };

  // Gérer la sélection multiple d'utilisateurs
  const handleRecipientChange = (values: string | string[]) => {
    // S'assurer d'avoir toujours un tableau
    const selectedValues = Array.isArray(values) ? values : [values];
    setSelectedRecipientIds(selectedValues);

    // Mettre à jour les emails des destinataires sélectionnés
    const selectedUsers = users.filter((u) => selectedValues.includes(u.id));
    const emails = selectedUsers.map((u) => u.email || "");
    setSelectedRecipientEmails(emails);

    setFormData((prev) => ({
      ...prev,
      recipients: selectedValues,
      recipientEmails: emails,
    }));
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

    // Si l'option "envoyer à tous" n'est pas cochée, vérifier qu'il y a au moins un destinataire
    if (
      !formData.sendToAll &&
      (!formData.recipients || formData.recipients.length === 0)
    ) {
      alert(
        "Veuillez sélectionner au moins un destinataire ou cocher l&apos;option 'Envoyer à tous les participants'"
      );
      return;
    }

    onSubmit(formData);
  };

  const removeRecipient = (id: string, index: number) => {
    const newRecipients = [...(formData.recipients || [])].filter(
      (_, i) => i !== index
    );
    const newEmails = [...(formData.recipientEmails || [])].filter(
      (_, i) => i !== index
    );

    setFormData((prev) => ({
      ...prev,
      recipients: newRecipients,
      recipientEmails: newEmails,
    }));

    setSelectedRecipientIds(newRecipients);
    setSelectedRecipientEmails(newEmails);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Sujet de l&apos;alerte</Label>
        <Input
          id="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sendToAll"
            checked={formData.sendToAll}
            onChange={handleCheckboxChange}
            aria-label="Envoyer à tous les membres de mon équipe"
            title="Envoyer à tous les membres de mon équipe"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Label htmlFor="sendToAll">
            Envoyer à tous les membres de mon équipe
          </Label>
        </div>

        {!formData.sendToAll && (
          <div className="space-y-2">
            <Label>Destinataires</Label>
            <div className="w-full">
              <UserSelect
                multiple
                value={selectedRecipientIds}
                onValueChange={handleRecipientChange}
                placeholder="Sélectionner un ou plusieurs destinataires..."
                aria-label="Sélectionner des destinataires"
                className="w-full"
                users={users}
              />
            </div>

            {/* Affichage des destinataires sélectionnés */}
            {selectedRecipientIds.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  Destinataires sélectionnés :
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipientEmails.map((email, index) => (
                    <Badge
                      key={selectedRecipientIds[index]}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() =>
                          removeRecipient(selectedRecipientIds[index], index)
                        }
                        aria-label={`Retirer ${email}`}
                        title={`Retirer ${email}`}
                        className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          disabled={!formData.sendToAll && selectedRecipientIds.length === 0}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!formData.sendToAll && selectedRecipientIds.length === 0}
        >
          Envoyer Alerte
        </Button>
      </div>
    </form>
  );
}
