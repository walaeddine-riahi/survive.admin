"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User, X, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis l'assistant virtuel de S.U.R.V.I.V.E. Resilience. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la communication avec l'API");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Erreur lors de la communication avec l'IA:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question ?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const ClaudeAvatar = () => (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 'var(--radius-md)',
      background: 'linear-gradient(135deg, #92400E, #D97706)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Sparkles size={16} color="white" strokeWidth={1.5} />
    </div>
  );

  return (
    <>
      {/* Bouton flottant (FAB) */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-12 w-12 rounded-[12px] shadow-[0_4px_16px_rgba(218,119,87,0.35)] bg-[#DA7757] hover:bg-[#C56345] text-white transition-all duration-300 hover:scale-[1.05] z-[90]",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <Sparkles size={20} strokeWidth={1.5} />
      </Button>

      {/* Interface du chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl flex flex-col overflow-hidden">
          {/* En-tête */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-primary)]">
            <div className="flex items-center gap-3">
              <ClaudeAvatar />
              <h3 className="font-semibold text-[var(--text-primary)] font-serif">Claude Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            >
              <X size={20} strokeWidth={1.5} />
            </Button>
          </div>

          {/* Zone de messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="flex flex-col gap-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-4",
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  )}
                >
                  {message.role === "assistant" && <ClaudeAvatar />}
                  <div
                    style={message.role === "user" ? {
                      background: 'var(--bg-tertiary)',
                      borderRadius: '18px 18px 4px 18px',
                      padding: '12px 16px',
                      maxWidth: '85%',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                      lineHeight: '1.6',
                    } : {
                      flex: 1,
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                      lineHeight: '1.7',
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <ClaudeAvatar />
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                    <span className="text-xs italic">Claude réfléchit...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Zone de saisie */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)] bg-[var(--bg-primary)]">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 bg-[var(--bg-surface)] border-[var(--border)] focus-visible:ring-[var(--accent-light)]"
              />
              <Button type="submit" size="icon" disabled={isLoading} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
                <Send size={18} strokeWidth={1.5} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
