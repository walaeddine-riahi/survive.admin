"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Incident, IncidentForm } from "../../IncidentForm";

const mockIncident: Incident = {
  id: "1",
  title: "Incident réseau",
  severity: "Critique",
  status: "En cours",
  date: "2024-06-01",
};

type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

const IncidentEditPage: FC<Props> = (props) => {
  const { params } = props;
  const incident = mockIncident;
  function handleEdit(data: Incident) {
    alert("Incident modifié !\n" + JSON.stringify(data, null, 2));
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Éditer l&apos;incident</h1>
        <Button asChild variant="outline">
          <Link href={`/incident/${incident.id}`}>Retour</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <IncidentForm
          initialData={incident}
          onSubmit={handleEdit}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
