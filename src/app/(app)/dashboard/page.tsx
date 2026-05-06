"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertTriangle,
  Zap,
  CheckCircle,
  FileText,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Users,
  Play,
  Star,
  Mail,
  FilePlus,
  Megaphone,
  Send,
  ClipboardList,
  BarChart2,
  Sparkles,
  Calendar,
  Clock,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";

// Données pour le graphique de revenus de l'admin
const revenueData = [
  { name: "Jan", total: 900 },
  { name: "Fév", total: 1800 },
  { name: "Mar", total: 1800 },
  { name: "Avr", total: 2700 },
  { name: "Mai", total: 2400 },
  { name: "Juin", total: 2100 },
];

const taskData = [
  { name: "Jan", tasks: 20 },
  { name: "Fév", tasks: 40 },
  { name: "Mar", tasks: 35 },
  { name: "Avr", tasks: 65 },
  { name: "Mai", tasks: 40 },
  { name: "Juin", tasks: 30 },
];

const riskData = [
  { name: "Jan", risks: 5 },
  { name: "Fév", risks: 7 },
  { name: "Mar", risks: 6 },
  { name: "Avr", risks: 8 },
  { name: "Mai", risks: 9 },
  { name: "Juin", risks: 7 },
];

const incidentData = [
  { name: "Jan", incidents: 1 },
  { name: "Fév", incidents: 1 },
  { name: "Mar", incidents: 0 },
  { name: "Avr", incidents: 2 },
  { name: "Mai", incidents: 1 },
  { name: "Juin", incidents: 2 },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [pData, setPData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateTimeStr, setDateTimeStr] = useState("");

  // Heure locale dynamique
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      setDateTimeStr(
        now.toLocaleString("fr-FR", options).replace(/^./, (str) => str.toUpperCase())
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch participant dashboard data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      fetch("/api/dashboard/participant")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          setPData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching participant dashboard:", err);
          setLoading(false);
        });
    } else if (status === "unauthenticated" || session?.user?.role === "ADMIN") {
      setLoading(false);
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-[#D97706] animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Chargement de votre tableau de bord...</span>
      </div>
    );
  }

  // --- RENDU PARTICIPANT ---
  if (session?.user?.role !== "ADMIN") {
    const user = pData?.user || session?.user;
    const activeAssignment = pData?.activeAssignment;
    const stats = pData?.stats || { totalSimulations: 0, scoreMoyen: "N/A", unreadMessagesCount: 0, activeAlertsCount: 0 };
    const simulations = pData?.simulations || [];
    const notifications = pData?.notifications || [];

    const statCards = [
      { label: "Simulations", value: stats.totalSimulations.toString(), delta: "Inscriptions", trend: "neutral", icon: Play },
      { label: "Score moyen", value: stats.scoreMoyen, delta: "Performance globale", trend: "up", icon: Star },
      { label: "Messages reçus", value: stats.unreadMessagesCount.toString(), delta: "Canal opérationnel", trend: "neutral", icon: Mail },
      { label: "Alertes actives", value: stats.activeAlertsCount.toString(), delta: "Priorité haute", trend: "down", icon: AlertTriangle },
    ];

    const quickActions = [
      { icon: FilePlus, label: "Nouveau SITREP", url: activeAssignment ? `/simulation/${activeAssignment.simulationId}/participant-view` : "#" },
      { icon: AlertTriangle, label: "Signaler incident", url: activeAssignment ? `/simulation/${activeAssignment.simulationId}/participant-view` : "#" },
      { icon: Megaphone, label: "Diffuser alerte", url: activeAssignment ? `/simulation/${activeAssignment.simulationId}/participant-view` : "#" },
      { icon: Send, label: "Envoyer message", url: activeAssignment ? `/simulation/${activeAssignment.simulationId}/participant-view` : "#" },
      { icon: ClipboardList, label: "Voir directives", url: activeAssignment ? `/simulation/${activeAssignment.simulationId}/participant-view` : "#" },
      { icon: BarChart2, label: "Mon rapport BIA", url: "/bia" },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Hero Section */}
        <div className="bg-[#252220] border border-[#3C3835] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[11px] text-[#78716C] font-semibold tracking-wider uppercase">
              {dateTimeStr || "Chargement..."}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#FAFAF9] tracking-tight">
              Bonjour, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-[#A8A29E] leading-relaxed">
              Vous participez à <strong className="text-[#FAFAF9]">{stats.totalSimulations} simulation(s)</strong>. Vos dernières directives tactiques sont prêtes.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            {activeAssignment ? (
              <>
                <div className="flex items-center gap-2 bg-[#2C2118] border border-orange-500/20 rounded-full px-4 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                  <span className="text-xs font-semibold text-[#D97706] uppercase tracking-wider">Simulation en cours</span>
                </div>
                <Link
                  href={`/simulation/${activeAssignment.simulationId}/participant-view`}
                  className="bg-[#D97706] hover:bg-[#B45309] text-[#78350F] font-bold text-sm px-5 py-2.5 rounded-xl transition duration-150 shadow-lg shadow-orange-500/10 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Accéder à la simulation
                </Link>
              </>
            ) : (
              <div className="text-sm text-[#78716C]">Aucune simulation active</div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, delta, icon: Icon }) => (
            <div key={label} className="bg-[#252220] border border-[#3C3835] rounded-2xl p-5 flex flex-col gap-3 shadow-md hover:border-[#4E4945] transition duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C] tracking-wide uppercase">{label}</span>
                <Icon className="w-4 h-4 text-[#3C3835]" strokeWidth={1.5} />
              </div>
              <div className="text-3xl font-extrabold text-[#FAFAF9] tracking-tight">{value}</div>
              <span className="text-[11px] text-[#57534E] font-medium">{delta}</span>
            </div>
          ))}
        </div>

        {/* Two Columns Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Active Simulation Card */}
            {activeAssignment ? (
              <div className="bg-[#2C2118] border border-orange-500/25 rounded-2xl p-6 flex flex-col gap-4 shadow-lg shadow-orange-500/5">
                <span className="text-[10px] font-bold text-[#D97706] tracking-wider uppercase">SIMULATION ACTIVE</span>
                <h3 className="text-lg font-bold text-[#FAFAF9] tracking-tight">{activeAssignment.title}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[#A8A29E]">
                    <Users className="w-4 h-4 text-[#78716C]" />
                    <span>{activeAssignment.teamName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#D97706] font-medium">
                    <Shield className="w-4 h-4 text-[#78716C]" />
                    <span>Rôle : {activeAssignment.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#A8A29E]">
                    <Clock className="w-4 h-4 text-[#78716C]" />
                    <span>Débutée le : {new Date(activeAssignment.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="w-full bg-[#3C3835] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#D97706] h-1.5 rounded-full" style={{ width: "35%" }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#78716C]">
                    <span>Progression globale</span>
                    <span className="font-semibold text-[#FAFAF9]">35%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#252220] border border-[#3C3835] rounded-2xl p-6 text-center text-sm text-[#78716C]">
                Aucune simulation active pour le moment.
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="bg-[#252220] border border-[#3C3835] rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold text-[#FAFAF9] mb-4 uppercase tracking-wider">Actions rapides</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActions.map(({ icon: Icon, label, url }) => (
                  <Link
                    key={label}
                    href={url}
                    className="bg-[#2E2B28] border border-[#3C3835] hover:border-[#D97706]/30 hover:bg-[#322E2B] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center transition duration-150 group"
                  >
                    <Icon className="w-5 h-5 text-[#A8A29E] group-hover:text-[#D97706] transition duration-150" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium text-[#78716C] group-hover:text-[#FAFAF9] leading-tight transition duration-150">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Simulations List */}
            <div className="bg-[#252220] border border-[#3C3835] rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#FAFAF9] uppercase tracking-wider">Mes simulations récentes</h3>
                <Link href="/participations" className="text-xs font-semibold text-[#D97706] hover:text-[#B45309] flex items-center gap-1">
                  Voir tout <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-[#2E2B28]">
                {simulations.length > 0 ? (
                  simulations.map((sim: any) => (
                    <div key={sim.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: sim.bg }}
                        >
                          {sim.icon === "play" ? (
                            <Play className="w-4 h-4" style={{ color: sim.color }} />
                          ) : (
                            <CheckCircle className="w-4 h-4" style={{ color: sim.color }} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#FAFAF9] tracking-tight">{sim.name}</span>
                          <span className="text-xs text-[#78716C] mt-0.5">{sim.meta}</span>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0"
                        style={{
                          backgroundColor: sim.bg,
                          color: sim.color,
                          borderColor: sim.color + "40",
                        }}
                      >
                        {sim.score || (sim.status === "active" ? "En cours" : sim.status === "planned" ? "Planifié" : "Terminé")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-[#78716C]">Vous n'avez pas de simulations récentes.</div>
                )}
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="bg-[#252220] border border-[#3C3835] rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold text-[#FAFAF9] mb-4 uppercase tracking-wider">Notifications récentes</h3>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((n: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", n.read ? "bg-[#3C3835]" : "bg-[#D97706]")} />
                      <div className="flex-1 space-y-1">
                        <p className={cn("text-xs leading-relaxed", n.read ? "text-[#57534E]" : "text-[#A8A29E]")}>{n.text}</p>
                        <span className="text-[10px] text-[#57534E] font-medium block">{n.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-[#78716C]">Aucune notification récente.</div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
    );
  }

  // --- RENDU ADMIN ---
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Tableau de bord Administrateur
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
