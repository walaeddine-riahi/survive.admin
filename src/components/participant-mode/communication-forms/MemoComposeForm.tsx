"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect } from "@/components/user-select";
import { User } from "@/components/user-select";
import { Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export type MemoFormData = {
  to: string[]; // recipient user IDs
  recipientPhones?: string[]; // derived phone numbers
  phone?: string | null; // single phone for backward compatibility
  subject?: string | null;
  content: string;
};

export default function MemoComposeForm({
  onSubmit,
  onCancel,
  simulationId,
}: {
  onSubmit: (data: MemoFormData) => void;
  onCancel: () => void;
  simulationId?: string;
}) {
  const { data: session } = useSession();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<MemoFormData>({
    to: [],
    recipientPhones: [],
    subject: "",
    content: "",
  });

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
            ? data.map((assignment: { user: User }) => assignment.user)
            : data;
          const otherUsers = allUsers.filter(
            (u: User) => u.id !== session?.user?.id
          );
          setUsers(otherUsers);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      }
    };

    if (session?.user?.id) fetchUsers();
  }, [session, simulationId]);

  useEffect(() => {
    const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));
    setFormData((prev) => ({
      ...prev,
      to: selectedUsers.map((u) => u.id),
      recipientPhones: selectedUsers.map((u) => u.phone || ""),
    }));
  }, [selectedUserIds, users]);

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, content: e.target.value }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const handleUserSelect = (values: string | string[]) => {
    const selectedValues = Array.isArray(values) ? values : [values];
    setSelectedUserIds(selectedValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to || formData.to.length === 0) return;
    onSubmit({ ...formData });
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
        <Label htmlFor="subject">Sujet (optionnel)</Label>
        <input
          id="subject"
          type="text"
          className="w-full border rounded px-2 py-1"
          value={formData.subject || ""}
          onChange={handleSubjectChange}
          placeholder="Sujet du message (facultatif)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Message</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={handleBodyChange}
          required
          rows={6}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Envoyer WhatsApp</Button>
      </div>
    </form>
  );
}
