"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface DynamicListFieldProps {
  title: string;
  description?: string;
  fields: FieldConfig[];
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
  defaultItem?: Record<string, unknown>;
  minItems?: number;
  maxItems?: number;
}

export function DynamicListField({
  title,
  description,
  fields,
  value = [],
  onChange,
  defaultItem,
  minItems = 0,
  maxItems,
}: DynamicListFieldProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getDefaultItem = (): Record<string, unknown> => {
    if (defaultItem) return { ...defaultItem, id: Date.now() };

    const item: Record<string, unknown> = { id: Date.now() };
    fields.forEach((field) => {
      switch (field.type) {
        case "number":
          item[field.name] = 0;
          break;
        case "checkbox":
          item[field.name] = false;
          break;
        default:
          item[field.name] = "";
      }
    });
    return item;
  };

  const addItem = () => {
    if (maxItems && value.length >= maxItems) return;
    const newValue = [...value, getDefaultItem()];
    onChange(newValue);
    setExpandedItems(new Set([...expandedItems, value.length]));
  };

  const removeItem = (index: number) => {
    if (value.length <= minItems) return;
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    expandedItems.delete(index);
    setExpandedItems(new Set(expandedItems));
  };

  const updateItem = (
    index: number,
    fieldName: string,
    fieldValue: unknown
  ) => {
    const newValue = [...value];
    newValue[index] = {
      ...newValue[index],
      [fieldName]: fieldValue,
    };
    onChange(newValue);
  };

  const getItemSummary = (item: Record<string, unknown>) => {
    // Essayer de créer un résumé intelligent de l'item
    const nameFields = [
      "nom",
      "name",
      "nom_activite",
      "nom_fournisseur",
      "nom_application_systeme",
      "intitule_role_fonction",
      "designation_equipement",
      "type_equipement",
      "type_nom_documentation",
    ];
    const summaryField = nameFields.find((field) => item[field]);
    return summaryField
      ? String(item[summaryField])
      : `Élément ${String(item.id)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          disabled={maxItems ? value.length >= maxItems : false}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {value.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">
              Aucun élément. Cliquez sur &quot;Ajouter&quot; pour commencer.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {value.map((item, index) => (
          <Card key={String(item.id) || index} className="relative">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(index)}
                  className="flex items-center gap-2 flex-1 text-left hover:text-primary transition-colors"
                >
                  {expandedItems.has(index) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <CardTitle className="text-sm font-medium">
                    {index + 1}. {getItemSummary(item)}
                  </CardTitle>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={value.length <= minItems}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {expandedItems.has(index) && (
              <CardContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className={
                        field.type === "textarea" ? "md:col-span-2" : ""
                      }
                    >
                      <Label htmlFor={`${field.name}-${index}`}>
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>

                      {field.type === "text" && (
                        <Input
                          id={`${field.name}-${index}`}
                          type="text"
                          placeholder={field.placeholder}
                          value={String(item[field.name] || "")}
                          onChange={(e) =>
                            updateItem(index, field.name, e.target.value)
                          }
                          className="mt-1.5"
                        />
                      )}

                      {field.type === "textarea" && (
                        <Textarea
                          id={`${field.name}-${index}`}
                          placeholder={field.placeholder}
                          value={String(item[field.name] || "")}
                          onChange={(e) =>
                            updateItem(index, field.name, e.target.value)
                          }
                          className="mt-1.5 min-h-[80px]"
                        />
                      )}

                      {field.type === "number" && (
                        <Input
                          id={`${field.name}-${index}`}
                          type="number"
                          placeholder={field.placeholder}
                          value={Number(item[field.name] ?? 0)}
                          onChange={(e) =>
                            updateItem(
                              index,
                              field.name,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="mt-1.5"
                        />
                      )}

                      {field.type === "select" && field.options && (
                        <Select
                          value={String(item[field.name] || "")}
                          onValueChange={(val) =>
                            updateItem(index, field.name, val)
                          }
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue
                              placeholder={field.placeholder || "Sélectionner"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {field.type === "checkbox" && (
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            id={`${field.name}-${index}`}
                            type="checkbox"
                            checked={Boolean(item[field.name] || false)}
                            onChange={(e) =>
                              updateItem(index, field.name, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label
                            htmlFor={`${field.name}-${index}`}
                            className="text-sm text-muted-foreground"
                          >
                            {field.placeholder || "Oui"}
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {value.length > 0 && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length} élément{value.length > 1 ? "s" : ""}
          {maxItems && ` sur ${maxItems} maximum`}
        </div>
      )}
    </div>
  );
}
