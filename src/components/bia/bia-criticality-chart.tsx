"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface BiaCriticalityChartProps {
  data: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const COLORS = {
  critical: "#ef4444", // red-500
  high: "#f97316", // orange-500
  medium: "#eab308", // yellow-500
  low: "#22c55e", // green-500
};

const LABELS = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};

export function BiaCriticalityChart({ data }: BiaCriticalityChartProps) {
  const chartData = [
    { name: LABELS.critical, value: data.critical, color: COLORS.critical },
    { name: LABELS.high, value: data.high, color: COLORS.high },
    { name: LABELS.medium, value: data.medium, color: COLORS.medium },
    { name: LABELS.low, value: data.low, color: COLORS.low },
  ].filter((item) => item.value > 0); // Ne montrer que les valeurs non nulles

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune donnée de criticité disponible
      </div>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} processus (
            {(
              (data.value /
                chartData.reduce((sum, item) => sum + item.value, 0)) *
              100
            ).toFixed(1)}
            %)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
