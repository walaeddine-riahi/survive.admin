"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type ReportFormData = {
  title: string;
  content: string;
};

export default function ReportComposeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: ReportFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ReportFormData>({
    title: "",
    content: "",
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du rapport</Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Contenu du rapport</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={10}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Envoyer Rapport</Button>
      </div>
    </form>
  );
}
