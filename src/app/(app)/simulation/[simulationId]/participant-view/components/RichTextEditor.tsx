import React, { useState, useRef } from "react";
import { 
  Bold, Italic, List, ListOrdered, Link, 
  Smile, Image as ImageIcon, Sparkles, 
  Type, AlignLeft, AlignCenter, AlignRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  onAIDraft?: () => void;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  id,
  onAIDraft,
  className
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = (command: string) => {
    // Basic formatting simulation for textarea (adding markdown-like tags)
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const selected = text.substring(start, end);
    
    let replacement = "";
    switch (command) {
      case "bold": replacement = `**${selected}**`; break;
      case "italic": replacement = `*${selected}*`; break;
      case "list": replacement = `\n- ${selected}`; break;
      default: replacement = selected;
    }
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    
    // Reset focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + 2, end + 2);
      }
    }, 0);
  };

  return (
    <div className={cn(
      "flex flex-col rounded-xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-950",
      isFocused ? "border-primary ring-2 ring-primary/10" : "border-border shadow-sm",
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-400" onClick={() => handleFormat("bold")}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-400" onClick={() => handleFormat("italic")}>
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-400" onClick={() => handleFormat("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-400">
            <Link className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-400 hidden sm:flex">
            <AlignCenter className="h-4 w-4" />
          </Button>
        </div>
        
        {onAIDraft && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/5 font-semibold text-xs"
            onClick={onAIDraft}
          >
            <Sparkles className="h-3 w-3" />
            Aider avec IA
          </Button>
        )}
      </div>

      {/* Editor Area */}
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || "Écrivez votre message ici..."}
        className="border-none focus-visible:ring-0 resize-none min-h-[200px] bg-transparent text-slate-800 dark:text-slate-200"
      />

      {/* Footer Info */}
      <div className="px-3 py-1.5 border-t bg-slate-50/30 dark:bg-slate-900/20 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        <span>Prêt pour envoi</span>
        <span>{value.length} caractères</span>
      </div>
    </div>
  );
}
