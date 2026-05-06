"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Données pour le graphique de revenus
const revenueData = [
  {
    name: "Jan",
    total: 900,
  },
  {
    name: "Fév",
    total: 1800,
  },
  {
    name: "Mar",
    total: 1800,
  },
  {
    name: "Avr",
    total: 2700,
  },
  {
    name: "Mai",
    total: 2400,
  },
  {
    name: "Juin",
    total: 2100,
  },
];

// Données pour le graphique de tâches
const taskData = [
  {
    name: "Jan",
    tasks: 20,
  },
  {
    name: "Fév",
    tasks: 40,
  },
  {
    name: "Mar",
    tasks: 35,
  },
  {
    name: "Avr",
    tasks: 65,
  },
  {
    name: "Mai",
    tasks: 40,
  },
  {
    name: "Juin",
    tasks: 30,
  },
];

// Données pour la gestion des risques
const riskData = [
  { name: "Jan", risks: 5 },
  { name: "Fév", risks: 7 },
  { name: "Mar", risks: 6 },
  { name: "Avr", risks: 8 },
  { name: "Mai", risks: 9 },
  { name: "Juin", risks: 7 },
];

// Données pour la gestion des incidents
const incidentData = [
  { name: "Jan", incidents: 1 },
  { name: "Fév", incidents: 1 },
  { name: "Mar", incidents: 0 },
  { name: "Avr", incidents: 2 },
  { name: "Mai", incidents: 1 },
  { name: "Juin", incidents: 2 },
];

import { AlertTriangle, Zap, CheckCircle, FileText, GraduationCap, TrendingUp, TrendingDown, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Tableau de bord
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)]">Bienvenue sur votre interface de résilience augmentée.</p>
      </div>

      {/* Stats Grid - Row 1 (Large Cards) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total des tâches", value: "12", trend: "+2", isPos: true },
          { title: "Tâches en cours", value: "4", trend: "-1", isPos: false },
          { title: "Tâches terminées", value: "8", trend: "+3", isPos: true },
          { title: "Membres d'équipe", value: "6", trend: "+1", isPos: true },
        ].map((stat, i) => (
          <Card key={i} className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px] p-[20px_24px] hover:border-[var(--border-subtle)] transition-colors duration-150 group">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-[0.05em]">
                {stat.title}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-semibold text-[var(--text-primary)]">{stat.value}</span>
                <div className={cn(
                  "inline-flex items-center gap-[3px] text-[12px]", 
                  stat.isPos ? "text-[#10B981]" : "text-[#EF4444]"
                )}>
                  {stat.isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{stat.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Stats Grid - Row 2 (Small Cards) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {[
          { title: "Risques actifs", value: "7", icon: AlertTriangle },
          { title: "Incidents", value: "2", icon: Zap },
          { title: "Conformité", value: "97%", icon: CheckCircle },
          { title: "Plans actifs", value: "8", icon: FileText },
          { title: "Formations", value: "3", icon: GraduationCap },
        ].map((stat, i) => (
          <Card key={i} className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px] p-[16px_20px] relative hover:border-[var(--border-subtle)] transition-colors duration-150">
            <stat.icon size={16} className="absolute top-4 right-4 text-[var(--border)]" />
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-[0.05em]">
                {stat.title}
              </span>
              <span className="text-[24px] font-semibold text-[var(--text-primary)]">{stat.value}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-[#DA7757]" />
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Évolution des revenus</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-hover)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ fontSize: "13px", color: "var(--text-primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#DA7757"
                  strokeWidth={2}
                  dot={{ fill: "var(--bg-primary)", stroke: "#DA7757", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-[#6366F1]" />
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Nombre de tâches par mois</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-hover)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ fontSize: "13px", color: "var(--text-primary)" }}
                />
                <Bar dataKey="tasks" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lower Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Évolution des risques</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-hover)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ fontSize: "13px", color: "var(--text-primary)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="risks" 
                  stroke="#EF4444" 
                  strokeWidth={2} 
                  dot={{ fill: "var(--bg-primary)", stroke: "#EF4444", strokeWidth: 2, r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Incidents par mois</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-hover)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ fontSize: "13px", color: "var(--text-primary)" }}
                />
                <Bar dataKey="incidents" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
