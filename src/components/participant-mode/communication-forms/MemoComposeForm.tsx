"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type MemoFormData = {
  subject: string;
  content: string;
};

export default function MemoComposeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: MemoFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<MemoFormData>({
    subject: "",
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
        <Label htmlFor="subject">Sujet du mémo</Label>
        <Input
          id="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Contenu du mémo</Label>
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
        <Button type="submit">Envoyer Mémo</Button>
      </div>
    </form>
  );
}
