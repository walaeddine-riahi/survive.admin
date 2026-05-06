"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BiaImpactMatrixProps {
  matrix: Record<string, Record<string, number>>;
}

const RTO_LABELS = ["0-4h", "4-24h", "24-72h", "72h+"];
const CRITICALITY_LABELS = ["low", "medium", "high", "critical"];

const CRITICALITY_DISPLAY = {
  low: { label: "Faible", color: "bg-emerald-500" },
  medium: { label: "Moyen", color: "bg-blue-500" },
  high: { label: "Élevé", color: "bg-orange-500" },
  critical: { label: "Critique", color: "bg-red-500" },
};

export function BiaImpactMatrix({ matrix }: BiaImpactMatrixProps) {
  // Calculer le total pour l'opacité
  const maxCount = Math.max(
    ...Object.values(matrix).flatMap((m) => Object.values(m)),
    1
  );

  const getHeatmapColor = (count: number, criticality: string) => {
    if (count === 0) return "bg-muted/30";
    
    // Intensité basée sur le nombre
    const opacity = Math.min(0.2 + (count / maxCount) * 0.8, 1);
    
    switch (criticality) {
      case "critical": return `rgba(239, 68, 68, ${opacity})`; // Red
      case "high": return `rgba(249, 115, 22, ${opacity})`; // Orange
      case "medium": return `rgba(59, 130, 246, ${opacity})`; // Blue
      case "low": return `rgba(16, 185, 129, ${opacity})`; // Emerald
      default: return `rgba(156, 163, 175, ${opacity})`;
    }
  };

  return (
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden flex flex-col h-full">
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Matrice d&apos;Impact BIA
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Répartition des processus selon leur criticité métier et leur délai de reprise (RTO).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="relative">
          {/* Grille de la matrice */}
          <div className="grid grid-cols-5 gap-2">
            {/* Axe Y Labels */}
            <div className="col-span-1 flex flex-col justify-around py-4">
               {RTO_LABELS.map((label) => (
                 <div key={label} className="text-[10px] font-black text-muted-foreground uppercase text-right pr-2">
                   {label}
                 </div>
               ))}
               <div className="h-4" /> {/* Spacer pour l'axe X */}
            </div>

            {/* Cellules de la Heatmap */}
            <div className="col-span-4 grid grid-cols-4 gap-2">
              {RTO_LABELS.map((rto) => (
                CRITICALITY_LABELS.map((crit) => {
                  const count = matrix[rto]?.[crit] || 0;
                  const color = getHeatmapColor(count, crit);
                  
                  return (
                    <TooltipProvider key={`${rto}-${crit}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="aspect-square rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default border border-border/50"
                            style={{ backgroundColor: count > 0 ? color : undefined }}
                          >
                            <span className={`text-sm font-bold ${count > 0 ? "text-white drop-shadow-md" : "text-muted-foreground/30"}`}>
                              {count}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{count} processus</p>
                          <p className="text-xs text-muted-foreground">
                            RTO: {rto} | Criticité: {CRITICALITY_DISPLAY[crit as keyof typeof CRITICALITY_DISPLAY].label}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              ))}

              {/* Axe X Labels */}
              {CRITICALITY_LABELS.map((crit) => (
                <div key={crit} className="text-center pt-2">
                  <div className={`h-1.5 w-full rounded-full mb-1 ${CRITICALITY_DISPLAY[crit as keyof typeof CRITICALITY_DISPLAY].color}`} />
                  <span className="text-[10px] font-black text-muted-foreground uppercase">
                    {CRITICALITY_DISPLAY[crit as keyof typeof CRITICALITY_DISPLAY].label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Zones de Risque Légende */}
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <div className="flex-1">
                 <p className="text-[10px] font-black text-red-900 dark:text-red-300 uppercase">Zone Critique</p>
                 <p className="text-[10px] text-red-700 dark:text-red-400">RTO &lt; 4h &amp; Criticité Max</p>
               </div>
               <Badge className="bg-red-500 font-bold">{matrix["0-4h"]?.["critical"] || 0}</Badge>
             </div>
             
             <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <div className="flex-1">
                 <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-300 uppercase">Zone Sécurisée</p>
                 <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Processus bien isolés</p>
               </div>
               <ShieldCheck className="h-4 w-4 text-emerald-500" />
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
