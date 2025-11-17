/**
 * Composant de sélection de Factory
 *
 * Permet de filtrer les processus/rapports par usine
 */

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface FactorySelectProps {
  factories: Array<{ id: string; name: string; code: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FactorySelect({
  factories,
  value,
  onValueChange,
  placeholder = "Toutes les usines",
  className,
}: FactorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes les usines</SelectItem>
        {factories.map((factory) => (
          <SelectItem key={factory.id} value={factory.id}>
            {factory.name} ({factory.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
