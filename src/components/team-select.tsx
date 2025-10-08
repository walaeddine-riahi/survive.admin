"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
}

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

interface Team {
  id: string;
  name: string;
}

interface TeamSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  form?: UseFormReturn<any>;
  name?: string;
  label?: string;
}

export function TeamSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner une équipe",
  form,
  name,
  label,
}: TeamSelectProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedTeam = teams.find((team) => team.id === value);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();
        setTeams(data);
        if (!value && data.length > 0) {
          onValueChange(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [value, onValueChange]);

  const renderSelect = () => (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger>
        <SelectValue>
          {selectedTeam ? selectedTeam.name : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            {team.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (form && name) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  onValueChange(value);
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return renderSelect();
}
