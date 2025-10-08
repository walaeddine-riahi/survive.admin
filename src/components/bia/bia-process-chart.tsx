"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BiaProcessChartProps {
  departmentData: Record<string, number>;
}

export function BiaProcessChart({ departmentData }: BiaProcessChartProps) {
  const chartData = Object.entries(departmentData).map(
    ([department, count]) => ({
      department:
        department.length > 15
          ? department.substring(0, 15) + "..."
          : department,
      fullName: department,
      count,
    })
  );

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune donnée de département disponible
      </div>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { fullName: string } }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.payload.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} processus
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
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="department"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            fontSize={12}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
