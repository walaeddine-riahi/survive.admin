"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export type Risk = {
  id?: string;
  title: string;
  type: string;
  status: string;
  date: string;
};

export function RiskForm({
  initialData,
  onSubmit,
  submitLabel = "Enregistrer",
}: {
  initialData?: Partial<Risk>;
  onSubmit: (data: Risk) => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<Risk>({
    title: initialData?.title || "",
    type: initialData?.type || "",
    status: initialData?.status || "",
    date: initialData?.date || "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Ex : Risque incendie"
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            placeholder="Ex : Opérationnel"
          />
        </div>
        <div>
          <Label htmlFor="status">Statut</Label>
          <Input
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            placeholder="Ex : Actif"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
