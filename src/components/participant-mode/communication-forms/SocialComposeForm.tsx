"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type SocialFormData = {
  platform: string;
  content: string;
};

export default function SocialComposeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: SocialFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<SocialFormData>({
    platform: "",
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
        <Label htmlFor="platform">Plateforme/Destinataire</Label>
        <Input
          id="platform"
          type="text"
          value={formData.platform}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Contenu du message</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={5}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Envoyer Message Social</Button>
      </div>
    </form>
  );
}
