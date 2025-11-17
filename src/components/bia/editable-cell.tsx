"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

type EditableCellProps = {
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null) => void;
  type?: "text" | "number" | "textarea" | "select" | "boolean";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  required?: boolean;
  min?: number;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
};

export function EditableCell({
  value,
  onChange,
  type = "text",
  options = [],
  placeholder = "",
  className = "",
  required = false,
  min,
  disabled = false,
  onKeyDown,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Tab") {
      handleSave();
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const displayValue = () => {
    if (value === null || value === undefined || value === "") {
      return (
        <span className="text-muted-foreground italic">
          {placeholder || "Vide"}
        </span>
      );
    }

    if (type === "boolean") {
      return value ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <Check className="h-4 w-4" /> Oui
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-gray-400">
          <X className="h-4 w-4" /> Non
        </span>
      );
    }

    if (type === "select" && options.length > 0) {
      const option = options.find((opt) => opt.value === value);
      return option?.label || value;
    }

    return value.toString();
  };

  if (disabled) {
    return (
      <div
        className={cn(
          "px-3 py-2 min-h-[40px] text-sm text-muted-foreground",
          className
        )}
      >
        {displayValue()}
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={cn(
          "px-3 py-2 min-h-[40px] text-sm cursor-pointer hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20 rounded",
          required && !value && "border-red-200 bg-red-50/30",
          className
        )}
      >
        {displayValue()}
      </div>
    );
  }

  // Mode édition
  if (type === "textarea") {
    return (
      <div className="relative">
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={tempValue as string}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("min-h-[80px] text-sm", className)}
          rows={3}
        />
      </div>
    );
  }

  if (type === "select") {
    return (
      <Select
        value={tempValue as string}
        onValueChange={(val) => {
          setTempValue(val);
          onChange(val);
          setIsEditing(false);
        }}
      >
        <SelectTrigger className={cn("text-sm", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "boolean") {
    return (
      <Select
        value={tempValue ? "true" : "false"}
        onValueChange={(val) => {
          const boolVal = val === "true";
          setTempValue(boolVal);
          onChange(boolVal);
          setIsEditing(false);
        }}
      >
        <SelectTrigger className={cn("text-sm", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Oui
            </span>
          </SelectItem>
          <SelectItem value="false">
            <span className="inline-flex items-center gap-2">
              <X className="h-4 w-4 text-gray-400" /> Non
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // Type text ou number
  return (
    <Input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={type}
      value={tempValue as string | number}
      onChange={(e) =>
        setTempValue(
          type === "number" ? Number(e.target.value) : e.target.value
        )
      }
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      min={min}
      className={cn("text-sm h-10", className)}
    />
  );
}
