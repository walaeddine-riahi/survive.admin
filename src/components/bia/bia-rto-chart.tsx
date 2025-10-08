"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Process = {
  id: string;
  name: string;
  rto: number;
  criticality: "low" | "medium" | "high" | "critical";
};

interface BiaRtoChartProps {
  processes: Process[];
}

export function BiaRtoChart({ processes }: BiaRtoChartProps) {
  // Regrouper les processus par plages RTO
  const rtoRanges = [
    { label: "0-2h", min: 0, max: 2, count: 0 },
    { label: "2-4h", min: 2, max: 4, count: 0 },
    { label: "4-8h", min: 4, max: 8, count: 0 },
    { label: "8-12h", min: 8, max: 12, count: 0 },
    { label: "12-24h", min: 12, max: 24, count: 0 },
    { label: "24h+", min: 24, max: Infinity, count: 0 },
  ];

  processes.forEach((process) => {
    const range = rtoRanges.find(
      (r) => process.rto >= r.min && process.rto < r.max
    );
    if (range) {
      range.count++;
    }
  });

  const chartData = rtoRanges.filter((range) => range.count > 0);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune donnée RTO disponible
      </div>
    );
  }

  const getBarColor = (label: string) => {
    switch (label) {
      case "0-2h":
        return "#22c55e"; // vert - excellent
      case "2-4h":
        return "#84cc16"; // vert clair - très bon
      case "4-8h":
        return "#eab308"; // jaune - bon
      case "8-12h":
        return "#f97316"; // orange - moyen
      case "12-24h":
        return "#ef4444"; // rouge - à améliorer
      case "24h+":
        return "#991b1b"; // rouge foncé - critique
      default:
        return "hsl(var(--primary))";
    }
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { label: string } }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const getStatus = (label: string) => {
        switch (label) {
          case "0-2h":
            return "Excellent";
          case "2-4h":
            return "Très bon";
          case "4-8h":
            return "Bon";
          case "8-12h":
            return "Moyen";
          case "12-24h":
            return "À améliorer";
          case "24h+":
            return "Critique";
          default:
            return "";
        }
      };

      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">RTO: {data.payload.label}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} processus
          </p>
          <p className="text-xs text-muted-foreground">
            Status: {getStatus(data.payload.label)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.label)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Légende des couleurs */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>0-4h (Excellent/Très bon)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>4-8h (Bon)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>8-12h (Moyen)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>12h+ (À améliorer/Critique)</span>
        </div>
      </div>
    </div>
  );
}
