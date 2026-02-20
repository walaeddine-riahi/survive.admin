"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, Volume2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceAssistantAvatarProps {
  message?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  onMinimize?: () => void;
  isMinimized?: boolean;
  embedded?: boolean; // Nouveau prop pour mode intégré
}

export function VoiceAssistantAvatar({
  message = "",
  isSpeaking = false,
  isListening = false,
  onMinimize,
  isMinimized = false,
  embedded = true, // Par défaut intégré dans le dialogue
}: VoiceAssistantAvatarProps) {
  const [showMessage, setShowMessage] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true); // Animation de salut au début

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 10000); // Cache après 10 secondes
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Animation de salut une seule fois au montage
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 3000); // Salut pendant 3 secondes
    return () => clearTimeout(timer);
  }, []);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={embedded ? "" : "fixed bottom-6 right-6 z-50"}
      >
        <Button
          onClick={onMinimize}
          size="lg"
          className="rounded-full w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-8 w-8" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={embedded ? "relative" : "fixed bottom-6 right-6 z-50"}
    >
      <div className="relative flex flex-col items-center gap-4">
        {/* Bulle de dialogue */}
        <AnimatePresence>
          {showMessage && message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="w-full max-w-md"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-4 border-2 border-blue-200 relative">
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-50 border-r-2 border-b-2 border-blue-200 rotate-45"></div>
                <p className="text-sm text-gray-800 text-center">{message}</p>
                {isSpeaking && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-blue-600">
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    <span className="text-xs">En train de parler...</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar du chatbot */}
        <div className="relative flex justify-center">
          {/* Cercle pulsant si en écoute */}
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-red-500 mx-auto"
              style={{ width: "120px", height: "120px" }}
            />
          )}

          {/* Avatar principal - Robot parlant */}
          <motion.div
            animate={
              isSpeaking
                ? {
                    scale: [1, 1.05, 1],
                  }
                : isListening
                ? { scale: [1, 1.1, 1] }
                : {}
            }
            transition={{
              repeat: isSpeaking || isListening ? Infinity : 0,
              duration: isSpeaking ? 0.6 : 2,
            }}
            className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 shadow-2xl flex flex-col items-center justify-center border-4 border-slate-500"
          >
            {/* Tête du robot */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Antenne */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                <motion.div
                  animate={isSpeaking ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-1 h-4 bg-slate-400"
                />
                <motion.div
                  animate={
                    isSpeaking
                      ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"
                />
              </div>

              {/* Yeux du robot */}
              <div className="flex gap-4 mb-2">
                <motion.div
                  animate={
                    isListening
                      ? { backgroundColor: ["#ef4444", "#dc2626", "#ef4444"] }
                      : isSpeaking
                      ? { backgroundColor: ["#3b82f6", "#2563eb", "#3b82f6"] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 border-2 border-white"
                />
                <motion.div
                  animate={
                    isListening
                      ? { backgroundColor: ["#ef4444", "#dc2626", "#ef4444"] }
                      : isSpeaking
                      ? { backgroundColor: ["#3b82f6", "#2563eb", "#3b82f6"] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 border-2 border-white"
                />
              </div>

              {/* Bouche du robot qui s'ouvre quand il parle */}
              <motion.div
                animate={
                  isSpeaking
                    ? {
                        scaleY: [1, 1.8, 1, 1.5, 1],
                        scaleX: [1, 0.9, 1, 0.95, 1],
                      }
                    : {}
                }
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="w-10 h-3 bg-slate-900 rounded-full border-2 border-slate-400 flex items-center justify-center overflow-hidden"
              >
                {/* Dents du robot */}
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-white rounded-sm" />
                  <div className="w-1 h-1 bg-white rounded-sm" />
                  <div className="w-1 h-1 bg-white rounded-sm" />
                  <div className="w-1 h-1 bg-white rounded-sm" />
                </div>
              </motion.div>

              {/* Ligne du cou */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-slate-600 border-x-2 border-slate-500" />
            </div>

            {/* Indicateur micro si en écoute */}
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, 0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2.5 border-3 border-white shadow-lg"
              >
                <Mic className="h-5 w-5 text-white" />
              </motion.div>
            )}

            {/* Indicateur son si en train de parler */}
            {isSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="absolute -top-2 -left-2 bg-blue-500 rounded-full p-2.5 border-3 border-white shadow-lg"
              >
                <Volume2 className="h-5 w-5 text-white" />
              </motion.div>
            )}

            {/* Bouton minimiser (optionnel en mode intégré) */}
            {onMinimize && !embedded && (
              <button
                onClick={onMinimize}
                aria-label="Minimiser l'assistant vocal"
                className="absolute -bottom-1 -right-1 bg-gray-700 hover:bg-gray-800 rounded-full p-1.5 border-2 border-white"
              >
                <Minimize2 className="h-3 w-3 text-white" />
              </button>
            )}

            {/* Main du robot qui fait un geste de salut au début */}
            {showGreeting && (
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{
                  x: [0, 15, 15, 0],
                  rotate: [0, 0, 25, -25, 25, -25, 25, 0],
                }}
                transition={{
                  duration: 2.5,
                  times: [0, 0.3, 0.4, 1],
                  ease: "easeInOut",
                }}
                className="absolute -right-8 top-6"
              >
                {/* Bras */}
                <div className="w-6 h-2 bg-slate-600 rounded-full border-2 border-slate-500" />
                {/* Main */}
                <motion.div
                  animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
                  transition={{ repeat: 3, duration: 0.4, delay: 0.5 }}
                  className="absolute -right-1 -top-1 w-5 h-5 bg-slate-600 rounded-lg border-2 border-slate-500 flex items-center justify-center"
                >
                  <div className="text-white text-xs">👋</div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Bulle de texte de salutation */}
          {showGreeting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-2xl shadow-lg whitespace-nowrap"
            >
              <div className="text-sm font-medium">Bonjour ! 👋</div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-500 rotate-45"></div>
            </motion.div>
          )}

          {/* Vagues d'onde sonore si parle */}
          {isSpeaking && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.6, 2.2],
                  opacity: [0.6, 0.3, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0,
                }}
                className="absolute inset-0 rounded-full border-3 border-blue-400 mx-auto"
                style={{ width: "120px", height: "120px", top: "4px" }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.6, 2.2],
                  opacity: [0.6, 0.3, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0.4,
                }}
                className="absolute inset-0 rounded-full border-3 border-cyan-400 mx-auto"
                style={{ width: "120px", height: "120px", top: "4px" }}
              />
            </>
          )}
        </div>

        {/* Texte d'état */}
        <div className="text-center">
          {isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-red-600 flex items-center gap-2 justify-center"
            >
              <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              J&apos;écoute votre réponse...
            </motion.p>
          )}
          {isSpeaking && !isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-blue-600 flex items-center gap-2 justify-center"
            >
              <Volume2 className="h-4 w-4 animate-pulse" />
              Je parle...
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
