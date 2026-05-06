"use client";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  name?: string; // Pour la rétrocompatibilité
}

interface UserSelectProps {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: any;
  name?: string;
  label?: string;
  multiple?: boolean;
  className?: string;
  users?: User[]; // Accepter une liste d'utilisateurs externe
}

export function UserSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner des utilisateurs...",
  form,
  name,
  label,
  multiple = false,
  className,
  users: externalUsers,
}: UserSelectProps) {
  // Assurez-vous que value est toujours défini
  const safeValue = value || (multiple ? [] : "");

  // Fonction de rappel qui appelle à la fois onValueChange et met à jour le formulaire si nécessaire
  const safeOnValueChange = (value: string | string[]) => {
    if (onValueChange) {
      onValueChange(value);
    }
  };

  const [internalUsers, setInternalUsers] = useState<User[]>([]);
  const users = externalUsers || internalUsers;
  const [open, setOpen] = useState(false);

  // Valeur sélectionnée pour l'affichage
  const selectedUsers = users.filter((user) =>
    Array.isArray(safeValue)
      ? safeValue.includes(user.id)
      : safeValue === user.id
  );

  // Fonction utilitaire pour vérifier si un utilisateur est sélectionné
  const isSelected = (userId: string) => {
    return multiple
      ? Array.isArray(safeValue) && safeValue.includes(userId)
      : safeValue === userId;
  };

  // Gestion de la sélection d'un utilisateur
  const handleSelect = (user: User) => {
    if (multiple) {
      const newValue = Array.isArray(safeValue) ? [...safeValue] : [];
      const index = newValue.findIndex((id) => id === user.id);

      if (index === -1) {
        newValue.push(user.id);
      } else {
        newValue.splice(index, 1);
      }

      safeOnValueChange(newValue);
    } else {
      safeOnValueChange(user.id);
      setOpen(false);
    }
  };

  useEffect(() => {
    // Ne charger les utilisateurs que si aucune liste externe n'est fournie
    if (!externalUsers) {
      const fetchUsers = async () => {
        try {
          const response = await fetch("/api/users");
          if (!response.ok)
            throw new Error("Échec de la récupération des utilisateurs");
          const data = await response.json();
          setInternalUsers(data);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des utilisateurs:",
            error
          );
        }
      };

      fetchUsers();
    }
  }, [externalUsers]);

  if (form && name) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          const handleValueChange = (selectedValue: string | string[]) => {
            if (onValueChange) {
              onValueChange(selectedValue);
            }
            field.onChange(selectedValue);
          };

          // Utilisation des fonctions définies en dehors du rendu
          const formHandleSelect = (user: User) => {
            if (multiple) {
              const newValue = Array.isArray(safeValue) ? [...safeValue] : [];
              const index = newValue.findIndex((id) => id === user.id);

              if (index === -1) {
                newValue.push(user.id);
              } else {
                newValue.splice(index, 1);
              }

              handleValueChange(newValue);
            } else {
              handleValueChange(user.id);
              setOpen(false);
            }
          };

          // Créer une version locale de isSelected pour le formulaire
          const formIsSelected = (userId: string) => isSelected(userId);

          return (
            <FormItem className="flex flex-col">
              <FormLabel>{label}</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-1">
                      <User className="mr-2 h-4 w-4" />
                      {selectedUsers.length > 0 ? (
                        <span className="truncate">
                          {multiple
                            ? `${selectedUsers.length} utilisateur${
                                selectedUsers.length > 1 ? "s" : ""
                              } sélectionné${
                                selectedUsers.length > 1 ? "s" : ""
                              }`
                            : `${selectedUsers[0].firstName} ${selectedUsers[0].lastName}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {placeholder}
                        </span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher un utilisateur..." />
                    <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
                      {users.map((user) => {
                        const selected = formIsSelected(user.id);
                        return (
                          <CommandItem
                            key={user.id}
                            onSelect={() => formHandleSelect(user)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div
                                className={cn(
                                  "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  selected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <Check className={"h-4 w-4"} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.email}
                                  {user.phone && (
                                    <div className="mt-1">
                                      <Phone className="inline h-3 w-3 mr-1" />
                                      {user.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  // Si on n'a pas de formulaire, on rend la version simplifiée
  if (!form) {
    return (
      <div className={className}>
        {label && <label className="text-sm font-medium">{label}</label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-1">
                <User className="mr-2 h-4 w-4" />
                {selectedUsers.length > 0 ? (
                  <span className="truncate">
                    {multiple
                      ? `${selectedUsers.length} utilisateur${
                          selectedUsers.length > 1 ? "s" : ""
                        } sélectionné${selectedUsers.length > 1 ? "s" : ""}`
                      : `${selectedUsers[0].firstName} ${selectedUsers[0].lastName}`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Rechercher un utilisateur..." />
              <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {users.map((user) => {
                  const selected = isSelected(user.id);
                  return (
                    <CommandItem
                      key={user.id}
                      onSelect={() => handleSelect(user)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className={"h-4 w-4"} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return null;
}
