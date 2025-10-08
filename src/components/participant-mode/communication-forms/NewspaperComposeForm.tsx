"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type NewspaperFormData = {
  title: string; // Événement / Information reçue
  content: string; // le reste
};

export default function NewspaperComposeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: NewspaperFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<NewspaperFormData>({
    title: "",
    content:
      `🕒 Heure : \n✅ Action décidée : \n👤 Personne responsable : \n📌 État / Résultat : \n📝 Observation / Commentaire : `,
  });

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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-semibold text-pink-600">📰 Nouvelle Entrée – Journal de Crise</h2>

      <div className="space-y-2">
        <Label htmlFor="title">🛑 Événement / Information reçue</Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Ex : Fumée détectée dans local électrique"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">🧾 Détails structurés</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={8}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-pink-600 text-white hover:bg-pink-700">
          Envoyer Article
        </Button>
      </div>
    </form>
  );
}
