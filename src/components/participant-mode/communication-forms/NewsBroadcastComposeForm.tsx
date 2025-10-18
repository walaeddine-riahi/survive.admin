"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type NewsBroadcastFormData = {
  title: string;
  content: string;
};

export default function NewsBroadcastComposeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: NewsBroadcastFormData) => void;
  onCancel: () => void;
}) {
  const [sitrepNumber, setSitrepNumber] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [site, setSite] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [triggerTime, setTriggerTime] = useState("");
  const [currentSituation, setCurrentSituation] = useState("");
  const [actionsInProgress, setActionsInProgress] = useState("");
  const [personnelSafe, setPersonnelSafe] = useState(true);
  const [personnelInjured, setPersonnelInjured] = useState("");
  const [personnelFatalities, setPersonnelFatalities] = useState("");
  const [equipmentStatus, setEquipmentStatus] = useState("");
  const [risks, setRisks] = useState("");
  const [nextTasks, setNextTasks] = useState("");
  const [needs, setNeeds] = useState("");
  const [nextUpdate, setNextUpdate] = useState("");
  const [sentBy, setSentBy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construire le contenu SITREP formaté
    const sitrepContent = `SITREP Template
SUBJECT: SITREP No. ${sitrepNumber || "[SITREP N°]"}

• Incident Type: ${incidentType || "[what type of incident]"}
• Site: ${site || "[Name of site]"}
• Date & Time: ${dateTime || "[DD/MM/YYYY – HH:MM]"}
________________________________________

1. Trigger Time (T0): ${triggerTime || "[HH:MM]"}

2. Current Situation: ${
      currentSituation || "[Factual description in 1–2 sentences]"
    }

3. Actions in Progress:
${actionsInProgress || "   o [Action 1]\n   o [Action 2]"}

4. Personnel (P): ${personnelSafe ? "☑" : "☐"} Safe & accounted for ${
      !personnelSafe && personnelInjured
        ? `☑ Injured: ${personnelInjured}`
        : "☐ Injured: [number]"
    } ${
      !personnelSafe && personnelFatalities
        ? `☑ Fatalities: ${personnelFatalities}`
        : "☐ Fatalities: [number]"
    }

5. Equipment / Facility (E):
${equipmentStatus || "   o [Impacted zone]\n   o [Status]"}

6. Risks (R): ${
      risks || "[e.g., rising water, generator failure, unstable grid supply]"
    }

7. Next Tasks (T):
${nextTasks || "   o [Measure 1]\n   o [Measure 2]"}

8. Needs (B): ${
      needs || "[e.g., fuel resupply, IT support, PPE, transportation]"
    }

9. Next Update: ${nextUpdate || '[HH:MM or "upon further developments"]'}

Sent by: ${sentBy || "[First Name LAST NAME], Local Crisis Coordinator"}
Acknowledgement: [Site Director] ✔ [Group / CMC] ✔`;

    onSubmit({
      title: `SITREP No. ${sitrepNumber || "[N°]"}`,
      content: sitrepContent,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
    >
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📋 Formulaire SITREP
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Remplissez les informations manquantes. Le rapport sera généré
          automatiquement.
        </p>
      </div>

      {/* En-tête SITREP */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          En-tête
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="sitrepNumber">N° SITREP *</Label>
            <Input
              id="sitrepNumber"
              type="text"
              value={sitrepNumber}
              onChange={(e) => setSitrepNumber(e.target.value)}
              placeholder="Ex: 001, 2024-10-18-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incidentType">Type d&apos;incident *</Label>
            <Input
              id="incidentType"
              type="text"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              placeholder="Ex: Inondation, Incendie, Panne électrique"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="site">Site *</Label>
          <Input
            id="site"
            type="text"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="Nom du site concerné"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTime">Date & Heure *</Label>
          <Input
            id="dateTime"
            type="text"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            placeholder="DD/MM/YYYY – HH:MM"
            required
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Détails de la situation
        </h4>

        <div className="space-y-2">
          <Label htmlFor="triggerTime">1. Trigger Time (T0) *</Label>
          <Input
            id="triggerTime"
            type="text"
            value={triggerTime}
            onChange={(e) => setTriggerTime(e.target.value)}
            placeholder="HH:MM"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentSituation">2. Situation actuelle *</Label>
          <Textarea
            id="currentSituation"
            value={currentSituation}
            onChange={(e) => setCurrentSituation(e.target.value)}
            placeholder="Description factuelle en 1-2 phrases"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actionsInProgress">3. Actions en cours *</Label>
          <Textarea
            id="actionsInProgress"
            value={actionsInProgress}
            onChange={(e) => setActionsInProgress(e.target.value)}
            placeholder="   o Action 1&#10;   o Action 2&#10;   o Action 3"
            rows={3}
            required
          />
        </div>
      </div>

      {/* Personnel */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          4. Personnel (P)
        </h4>

        <div className="flex items-center space-x-2 mb-3">
          <input
            type="checkbox"
            id="personnelSafe"
            checked={personnelSafe}
            onChange={(e) => setPersonnelSafe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
            aria-label="Personnel en sécurité"
          />
          <Label htmlFor="personnelSafe" className="font-normal cursor-pointer">
            Tout le personnel en sécurité et comptabilisé
          </Label>
        </div>

        {!personnelSafe && (
          <div className="grid grid-cols-2 gap-3 ml-6">
            <div className="space-y-2">
              <Label htmlFor="personnelInjured">Nombre de blessés</Label>
              <Input
                id="personnelInjured"
                type="number"
                value={personnelInjured}
                onChange={(e) => setPersonnelInjured(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personnelFatalities">Nombre de décès</Label>
              <Input
                id="personnelFatalities"
                type="number"
                value={personnelFatalities}
                onChange={(e) => setPersonnelFatalities(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Équipement */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          5. Équipement / Installation (E)
        </h4>
        <div className="space-y-2">
          <Textarea
            id="equipmentStatus"
            value={equipmentStatus}
            onChange={(e) => setEquipmentStatus(e.target.value)}
            placeholder="   o Zone impactée&#10;   o Statut"
            rows={2}
          />
        </div>
      </div>

      {/* Risques */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          6. Risques (R)
        </h4>
        <div className="space-y-2">
          <Textarea
            id="risks"
            value={risks}
            onChange={(e) => setRisks(e.target.value)}
            placeholder="Ex: montée des eaux, panne de générateur, alimentation électrique instable"
            rows={2}
          />
        </div>
      </div>

      {/* Tâches suivantes */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          7. Tâches suivantes (T)
        </h4>
        <div className="space-y-2">
          <Textarea
            id="nextTasks"
            value={nextTasks}
            onChange={(e) => setNextTasks(e.target.value)}
            placeholder="   o Mesure 1&#10;   o Mesure 2"
            rows={2}
          />
        </div>
      </div>

      {/* Besoins */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          8. Besoins (B)
        </h4>
        <div className="space-y-2">
          <Textarea
            id="needs"
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            placeholder="Ex: réapprovisionnement en carburant, support IT, EPI, transport"
            rows={2}
          />
        </div>
      </div>

      {/* Prochaine mise à jour */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          9. Prochaine mise à jour
        </h4>
        <div className="space-y-2">
          <Input
            id="nextUpdate"
            type="text"
            value={nextUpdate}
            onChange={(e) => setNextUpdate(e.target.value)}
            placeholder='HH:MM ou "dès évolution"'
          />
        </div>
      </div>

      {/* Expéditeur */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Expéditeur
        </h4>
        <div className="space-y-2">
          <Label htmlFor="sentBy">Envoyé par *</Label>
          <Input
            id="sentBy"
            type="text"
            value={sentBy}
            onChange={(e) => setSentBy(e.target.value)}
            placeholder="Prénom NOM, Coordinateur de Crise Local"
            required
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-white dark:bg-gray-950 pb-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Envoyer SITREP
        </Button>
      </div>
    </form>
  );
}
