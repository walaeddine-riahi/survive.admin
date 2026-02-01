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
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des tâches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tâches en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              -1 depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tâches terminées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +3 depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Membres de l&apos;équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              +1 depuis le mois dernier
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Risques actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">+1 ce mois-ci</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">-1 ce mois-ci</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conformité (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97%</div>
            <p className="text-xs text-muted-foreground">+2% ce mois-ci</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 ce mois-ci</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 ce mois-ci</p>
          </CardContent>
        </Card>
      </div>
      {/* Section Graphiques */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#008080"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>Nombre de tâches par mois</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taskData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar dataKey="tasks" fill="#f9b233" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Section Graphiques avancés */}
      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <Card className="bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>Évolution des risques</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={riskData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="risks"
                  stroke="#008080"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>Incidents par mois</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incidentData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar dataKey="incidents" fill="#f87171" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
