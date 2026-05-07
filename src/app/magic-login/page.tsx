"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

function MagicLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"connecting" | "success" | "error">("connecting");
  const [errorMsg, setErrorMsg] = useState("");

  const token = searchParams.get("token");
  const simulationId = searchParams.get("simulationId");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Jeton de connexion automatique manquant ou altéré.");
      return;
    }

    const performLogin = async () => {
      try {
        const callbackUrl = simulationId 
          ? `/simulation/${simulationId}/participant-view`
          : "/simulation";

        const result = await signIn("credentials", {
          magicToken: token,
          callbackUrl,
          redirect: false,
        });

        if (result?.error) {
          setStatus("error");
          setErrorMsg(result.error || "La clé de connexion automatique est invalide ou a expiré.");
        } else {
          setStatus("success");
          window.location.href = callbackUrl;
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || "Une erreur technique est survenue lors de la connexion.");
      }
    };

    performLogin();
  }, [token, simulationId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#12100E] text-[#F5F4F0] p-4 font-sans selection:bg-[#F97316] selection:text-[#12100E]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.07)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      <div className="relative w-full max-w-md bg-[#1A1715] border border-[#2B2623] rounded-2xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F97316] via-[#FF8A3D] to-[#D97706]" />

        {status === "connecting" && (
          <div className="space-y-6">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-[#F97316]/20 rounded-full blur-xl w-16 h-16 mx-auto animate-pulse" />
              <Loader2 className="h-12 w-12 text-[#F97316] animate-spin relative z-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-[#FAF9F5]">Connexion Sécurisée...</h1>
              <p className="text-sm text-[#9E938A]">
                Vérification de vos privilèges opérationnels et chargement de la cellule de crise **SURVIVE**.
              </p>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#F97316]/50 font-mono animate-pulse">
              [ ACCÈS CRYPTOGRAPHIQUE SÉCURISÉ ]
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl w-16 h-16 mx-auto animate-pulse" />
              <ShieldCheck className="h-12 w-12 text-green-500 relative z-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-[#FAF9F5]">Accès Accordé</h1>
              <p className="text-sm text-green-400/80">
                Clé de session validée. Redirection vers votre poste opérationnel...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl w-16 h-16 mx-auto animate-pulse" />
              <AlertTriangle className="h-12 w-12 text-red-500 relative z-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-red-500">Connexion Interrompue</h1>
              <p className="text-sm text-[#9E938A] leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => router.push("/connection")}
              className="w-full py-3 px-4 bg-[#F97316] hover:bg-[#EA580C] text-[#FAF9F5] font-semibold rounded-lg transition-colors duration-200 text-sm shadow-lg shadow-[#F97316]/10"
            >
              Se connecter manuellement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MagicLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#12100E] text-[#F5F4F0]">
        <Loader2 className="h-10 w-10 text-[#F97316] animate-spin" />
      </div>
    }>
      <MagicLoginContent />
    </Suspense>
  );
}
