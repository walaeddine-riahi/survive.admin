"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header - Clean & Minimal */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de vos activités</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary-flat text-sm">
            Exporter
          </button>
          <button className="btn-primary-flat text-sm">
            Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Primary Stats - Enterprise Cards with Status Dots */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              +16.7%
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Total tâches
            </p>
            <p className="text-2xl font-semibold text-foreground">12</p>
            <p className="text-xs text-muted-foreground mt-1">+2 cette semaine</p>
          </div>
        </div>

        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-9 w-9 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              En cours
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Tâches actives
            </p>
            <p className="text-2xl font-semibold text-foreground">4</p>
            <p className="text-xs text-muted-foreground mt-1">-1 cette semaine</p>
          </div>
        </div>

        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-9 w-9 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              +37.5%
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Tâches terminées
            </p>
            <p className="text-2xl font-semibold text-foreground">8</p>
            <p className="text-xs text-muted-foreground mt-1">+3 cette semaine</p>
          </div>
        </div>

        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-9 w-9 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              +20%
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Membres actifs
            </p>
            <p className="text-2xl font-semibold text-foreground">6</p>
            <p className="text-xs text-muted-foreground mt-1">+1 ce mois</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats - Compact & Clean */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div className="card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Risques actifs</p>
              <p className="text-lg font-semibold text-foreground">7</p>
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Incidents</p>
              <p className="text-lg font-semibold text-foreground">2</p>
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Conformité</p>
              <p className="text-lg font-semibold text-foreground">97%</p>
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Plans actifs</p>
              <p className="text-lg font-semibold text-foreground">8</p>
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Formations</p>
              <p className="text-lg font-semibold text-foreground">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Material Design */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-enterprise">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">Évolution des revenus</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Derniers 6 mois</p>
          </div>
          <div className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderRadius: 6,
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card-enterprise">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">Tâches par mois</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Activité mensuelle</p>
          </div>
          <div className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderRadius: 6,
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Bar 
                    dataKey="tasks" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-enterprise">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">Évolution des risques</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Surveillance continue</p>
          </div>
          <div className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={riskData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderRadius: 6,
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="risks"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card-enterprise">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">Incidents par mois</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Historique des incidents</p>
          </div>
          <div className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incidentData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderRadius: 6,
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Bar 
                    dataKey="incidents" 
                    fill="#f97316" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
