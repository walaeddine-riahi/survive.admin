"use client";

import { RiskMatrixConfig, calculateScore, getThresholdForScore } from "@/lib/bcm/risk-matrix-types";
import { cn } from "@/lib/utils";

interface MatrixSelectorProps {
  config: RiskMatrixConfig;
  xValue: number;
  yValue: number;
  onChange: (x: number, y: number) => void;
}

export function MatrixSelector({ config, xValue, yValue, onChange }: MatrixSelectorProps) {
  const xLevels = [...config.axeX.levels].sort((a, b) => a.value - b.value);
  const yLevels = [...config.axeY.levels].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `40px ${xLevels.map(() => "1fr").join(" ")}` }}
        >
          <div />
          {xLevels.map((l) => (
            <div key={l.value} className="text-center pb-2">
              <span className="text-[10px] font-black text-muted-foreground">{l.value}</span>
            </div>
          ))}

          {yLevels.map((yLevel) => (
            <div key={`row-${yLevel.value}`} className="contents">
              <div className="flex items-center justify-center border-r border-white/5">
                <span className="text-[10px] font-black text-muted-foreground">{yLevel.value}</span>
              </div>
              {xLevels.map((xLevel) => {
                const score = calculateScore(config, xLevel.value, yLevel.value);
                const thresh = getThresholdForScore(config, score);
                const isActive = xValue === xLevel.value && yValue === yLevel.value;

                return (
                  <button
                    key={`${xLevel.value}-${yLevel.value}`}
                    type="button"
                    onClick={() => onChange(xLevel.value, yLevel.value)}
                    className={cn(
                      "h-10 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-200 border-2",
                      isActive 
                        ? "scale-110 z-10 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                        : "border-transparent hover:border-white/20"
                    )}
                    style={{ 
                      backgroundColor: thresh?.color || "#ffffff", 
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                    }}
                    title={`${xLevel.label} (${xLevel.value}) × ${yLevel.label} (${yLevel.value}) = ${score}`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">{config.axeX.label}</p>
          <p className="text-xs font-bold text-white truncate">
            {xLevels.find(l => l.value === xValue)?.label || "N/A"} ({xValue})
          </p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">{config.axeY.label}</p>
          <p className="text-xs font-bold text-white truncate">
            {yLevels.find(l => l.value === yValue)?.label || "N/A"} ({yValue})
          </p>
        </div>
      </div>

      {getThresholdForScore(config, calculateScore(config, xValue, yValue)) && (
        <div 
          className="p-4 rounded-xl text-center shadow-lg border border-white/10"
          style={{ 
            backgroundColor: `${getThresholdForScore(config, calculateScore(config, xValue, yValue))?.color}22`,
            borderColor: `${getThresholdForScore(config, calculateScore(config, xValue, yValue))?.color}44`
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Niveau de Risque</p>
          <p className="text-xl font-black uppercase tracking-tighter" style={{ color: getThresholdForScore(config, calculateScore(config, xValue, yValue))?.color }}>
            {getThresholdForScore(config, calculateScore(config, xValue, yValue))?.label}
          </p>
          <p className="text-[10px] font-bold text-white/40 mt-1">
            Action: {getThresholdForScore(config, calculateScore(config, xValue, yValue))?.actionRequired}
          </p>
        </div>
      )}
    </div>
  );
}
