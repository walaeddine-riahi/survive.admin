import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  AlertTriangle,
  Shield,
  TrendingUp,
  CheckCircle2,
  Settings,
  Zap,
  Target,
  Clock,
  FileText,
  Bell,
} from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            Plateforme de Continuité d&apos;Activité
          </Badge>
          <h1 className="text-5xl font-bold mb-6">S.U.R.V.I.V.E.</h1>
          <p className="text-xl font-semibold mb-2 text-blue-100">Resilience</p>
          <p className="text-sm text-blue-200 mb-4 italic tracking-wider">
            Sustainability • Unity • Resilience • Vision • Innovation •
            Versatility • Efficiency
          </p>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Une solution complète pour renforcer la résilience de votre
            organisation. Analyse d&apos;impact, simulation de crise et gestion
            d&apos;équipe dans une seule plateforme.
          </p>
          <p className="text-sm italic text-blue-200 mb-6">
            &quot;When the going gets tough, the tough get going&quot;
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Commencer gratuitement</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/connection">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Fonctionnalités Principales
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez comment S.U.R.V.I.V.E. Resilience peut transformer la
            gestion de crise de votre organisation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Analyse d&apos;Impact (BIA)</CardTitle>
              <CardDescription>
                Évaluez la criticité de vos processus métier et anticipez les
                impacts d&apos;une interruption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Analyse IA avec Google Gemini</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Analyse heuristique rapide</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Vue consolidée par usine</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Simulation de Crise</CardTitle>
              <CardDescription>
                Entraînez vos équipes avec des exercices de crise réalistes et
                interactifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Scénarios personnalisables</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Injections d&apos;événements en temps réel</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Suivi de progression des tâches</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Gestion d&apos;Équipes</CardTitle>
              <CardDescription>
                Organisez vos collaborateurs et contrôlez les accès de manière
                efficace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Gestion par rôles (Admin/User)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Création d&apos;équipes multiples</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Authentification Google</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Module Demos */}
      <section className="bg-white dark:bg-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="bia" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="bia">Module BIA</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="teams">Équipes</TabsTrigger>
            </TabsList>

            {/* BIA Module Demo */}
            <TabsContent value="bia" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">
                  Module d&apos;Analyse d&apos;Impact (BIA)
                </h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Transformez votre compréhension des risques métier avec une
                  analyse approfondie et des recommandations intelligentes
                </p>
              </div>

              {/* Screenshot Simulation: List of Reports */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Liste des Rapports BIA
                  </CardTitle>
                  <CardDescription>
                    Vue organisée par usine avec options d&apos;analyse
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Simulated toolbar */}
                  <div className="flex gap-2 mb-4 pb-4 border-b">
                    <Badge variant="outline">Tous les rapports</Badge>
                    <Badge variant="default">Par usine</Badge>
                    <Badge variant="outline">Mes rapports</Badge>
                  </div>

                  {/* Simulated report groups */}
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          🏭 Usine de Production A
                          <Badge className="ml-2">8 rapports</Badge>
                        </h4>
                        <Button size="sm" className="gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Analyser l&apos;usine
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded border flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Ligne de production principale
                            </p>
                            <p className="text-xs text-muted-foreground">
                              RTO: 4h | Impact: Élevé
                            </p>
                          </div>
                          <Badge variant="destructive">Critique</Badge>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded border flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Système de contrôle qualité
                            </p>
                            <p className="text-xs text-muted-foreground">
                              RTO: 8h | Impact: Moyen
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-orange-500 text-white"
                          >
                            Important
                          </Badge>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded border flex items-center justify-between">
                          <div>
                            <p className="font-medium">Gestion des stocks</p>
                            <p className="text-xs text-muted-foreground">
                              RTO: 24h | Impact: Faible
                            </p>
                          </div>
                          <Badge variant="secondary">Modéré</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          🏭 Usine de Distribution B
                          <Badge className="ml-2">5 rapports</Badge>
                        </h4>
                        <Button size="sm" variant="outline" className="gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Analyser l&apos;usine
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cliquez pour voir les rapports de cette usine...
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screenshot Simulation: Individual Report Analysis */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Analyse Individuelle d&apos;un Rapport
                  </CardTitle>
                  <CardDescription>
                    Résultats d&apos;analyse avec recommandations détaillées
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Analysis tabs */}
                    <div className="flex gap-2 border-b pb-3">
                      <Button size="sm" variant="default">
                        Analyse IA
                      </Button>
                      <Button size="sm" variant="outline">
                        Analyse Heuristique
                      </Button>
                      <Button size="sm" variant="outline">
                        Comparaison
                      </Button>
                    </div>

                    {/* Simulated analysis results */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                              9.2/10
                            </div>
                            <p className="text-sm font-semibold">
                              Score de Criticité
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Processus hautement critique
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                              4h
                            </div>
                            <p className="text-sm font-semibold">
                              RTO Recommandé
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Temps de reprise optimal
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                              8
                            </div>
                            <p className="text-sm font-semibold">
                              Recommandations
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Actions prioritaires
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* SPOFs identified */}
                    <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        Points de Défaillance Uniques (SPOFs)
                      </h4>
                      <ul className="space-y-2">
                        <li className="text-sm flex items-start gap-2">
                          <span className="text-orange-600 font-bold">•</span>
                          <span>
                            <strong>Serveur principal</strong> : Pas de
                            redondance, point critique unique
                          </span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <span className="text-orange-600 font-bold">•</span>
                          <span>
                            <strong>Expert technique unique</strong> : Jean
                            Dupont est le seul à maîtriser le système
                          </span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <span className="text-orange-600 font-bold">•</span>
                          <span>
                            <strong>Fournisseur exclusif</strong> : Aucune
                            solution de secours identifiée
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Recommandations Prioritaires
                      </h4>
                      <ol className="space-y-2">
                        <li className="text-sm flex items-start gap-2">
                          <Badge className="shrink-0">1</Badge>
                          <span>
                            Mettre en place une infrastructure redondante pour
                            le serveur principal
                          </span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Badge className="shrink-0">2</Badge>
                          <span>
                            Former au moins 2 personnes supplémentaires sur le
                            système critique
                          </span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Badge className="shrink-0">3</Badge>
                          <span>
                            Identifier et valider un fournisseur de secours dans
                            les 30 jours
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screenshot Simulation: Factory-wide Analysis */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analyse Consolidée - Usine de Production A
                  </CardTitle>
                  <CardDescription>
                    Vue d&apos;ensemble de tous les processus critiques
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Global metrics */}
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
                        <div className="text-2xl font-bold">8 / 8</div>
                        <p className="text-xs mt-1">Rapports Analysés</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-lg">
                        <div className="text-2xl font-bold">8.5 / 10</div>
                        <p className="text-xs mt-1">Criticité Globale</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg">
                        <div className="text-2xl font-bold">23</div>
                        <p className="text-xs mt-1">SPOFs Identifiés</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs mt-1">Actions à Mener</p>
                      </div>
                    </div>

                    {/* Distribution chart simulation */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">
                        Distribution des Niveaux de Criticité
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">Critique (8-10)</span>
                            <span>3 processus</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                            <div className="bg-red-500 h-3 rounded-full w-[37.5%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">Important (6-8)</span>
                            <span>3 processus</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                            <div className="bg-orange-500 h-3 rounded-full w-[37.5%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">Modéré (4-6)</span>
                            <span>2 processus</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                            <div className="bg-yellow-500 h-3 rounded-full w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top risks */}
                    <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Top 3 des Risques Systémiques
                      </h4>
                      <div className="space-y-2">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded border-l-4 border-red-500">
                          <p className="font-medium text-sm">
                            Dépendance au réseau électrique unique
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Affecte 6 processus critiques
                          </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded border-l-4 border-orange-500">
                          <p className="font-medium text-sm">
                            Manque de personnel formé de secours
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Affecte 4 processus critiques
                          </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded border-l-4 border-yellow-500">
                          <p className="font-medium text-sm">
                            Vieillissement de l&apos;infrastructure IT
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Affecte 3 processus critiques
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          1. Création de Rapports
                        </CardTitle>
                        <CardDescription>
                          Définissez vos processus critiques
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Créez des rapports détaillés pour chaque processus métier
                      avec :
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>
                          <strong>Impacts</strong> : Financiers, réputationnels,
                          opérationnels
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>
                          <strong>RTO/RPO</strong> : Objectifs de reprise
                          d&apos;activité
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Settings className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>
                          <strong>Dépendances</strong> : Systèmes, fournisseurs,
                          équipes
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          2. Analyse Intelligente
                        </CardTitle>
                        <CardDescription>
                          IA + Analyse heuristique
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Analyse IA (Google Gemini)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Analyse approfondie avec identification des SPOFs et
                          recommandations personnalisées
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Analyse Heuristique
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Évaluation rapide basée sur des règles éprouvées de
                          gestion des risques
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          3. Analyse Consolidée par Usine
                        </CardTitle>
                        <CardDescription>
                          Vue d&apos;ensemble stratégique de toute une usine
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Score de Criticité Global
                        </h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          8.5/10
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Basé sur tous les processus
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Points de Défaillance
                        </h4>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          12 SPOFs
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Identifiés et priorisés
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                        <h4 className="font-semibold mb-2">Recommandations</h4>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          24 Actions
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pour améliorer la résilience
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Agrégez automatiquement les données de tous les rapports
                      BIA d&apos;une usine pour obtenir une vision stratégique
                      complète, identifier les risques systémiques et prioriser
                      les investissements.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Simulation Module Demo */}
            <TabsContent value="simulation" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">
                  Module de Simulation de Crise
                </h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Préparez vos équipes avec des exercices de crise interactifs
                  et réalistes
                </p>
              </div>

              {/* Screenshot Simulation: Simulation List */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Liste des Simulations de Crise
                  </CardTitle>
                  <CardDescription>
                    Gérez vos exercices de bout en bout
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Simulated simulation cards */}
                    <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              Cyberattaque Ransomware - Usine A
                            </h4>
                            <Badge className="bg-red-600">EN COURS</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Simulation d&apos;une attaque par ransomware sur les
                            systèmes de production
                          </p>
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              12 participants
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              8/15 tâches
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Démarrée il y a 2h30
                            </span>
                          </div>
                        </div>
                        <Button size="sm">Gérer</Button>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full w-[53%]"></div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              Panne majeure d&apos;électricité
                            </h4>
                            <Badge variant="outline">BROUILLON</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Test de la procédure de basculement sur groupe
                            électrogène
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />0 participants
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />5 tâches
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Préparer
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              Crise sanitaire - Site B
                            </h4>
                            <Badge variant="secondary">TERMINÉE</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Simulation d&apos;une épidémie affectant le
                            personnel
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Complétée le 25 mars 2025</span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              12/12 tâches
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Voir le rapport
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screenshot Simulation: Animator Dashboard */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Tableau de Bord Animateur
                  </CardTitle>
                  <CardDescription>
                    Vue complète pour piloter la simulation en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Timer and status */}
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                        <div className="text-2xl font-bold">02:34:12</div>
                        <p className="text-xs mt-1">Temps écoulé</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                        <div className="text-2xl font-bold">8 / 15</div>
                        <p className="text-xs mt-1">Tâches complétées</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                        <div className="text-2xl font-bold">3 / 8</div>
                        <p className="text-xs mt-1">Injections déclenchées</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
                        <Users className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                        <div className="text-2xl font-bold">12 / 12</div>
                        <p className="text-xs mt-1">Participants actifs</p>
                      </div>
                    </div>

                    {/* Tasks overview */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        État des Tâches en Temps Réel
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded border-l-4 border-green-500">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              Isoler le réseau de l&apos;usine
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Équipe IT • Complétée à 14:25
                            </p>
                          </div>
                          <Badge className="bg-green-600">✓ Terminée</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded border-l-4 border-blue-500">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              Contacter les clients impactés
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cellule Communication • En cours depuis 30min
                            </p>
                          </div>
                          <Badge className="bg-blue-600">En cours</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded border-l-4 border-slate-300 dark:border-slate-700">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              Restaurer depuis les sauvegardes
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Équipe IT • Non démarrée
                            </p>
                          </div>
                          <Badge variant="outline">À faire</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Pending injections */}
                    <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-orange-600" />
                        Injections Planifiées
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              📧 Email du journaliste
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Prévu à T+3h (dans 26 min)
                            </p>
                          </div>
                          <Button size="sm">Déclencher maintenant</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              📞 Appel client VIP
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Prévu à T+4h
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Planifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screenshot Simulation: Participant View */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Vue Participant
                  </CardTitle>
                  <CardDescription>
                    Interface des utilisateurs pendant l&apos;exercice
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Scenario context */}
                    <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Contexte de la Simulation
                      </h4>
                      <p className="text-sm">
                        Une attaque par ransomware a chiffré les serveurs de
                        production. Les systèmes critiques sont hors ligne.
                        Votre objectif est de restaurer l&apos;activité dans les
                        6 heures tout en communiquant avec les parties
                        prenantes.
                      </p>
                    </div>

                    {/* My tasks */}
                    <div>
                      <h4 className="font-semibold mb-3">
                        Mes Tâches Assignées
                      </h4>
                      <div className="space-y-2">
                        <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-orange-600">URGENT</Badge>
                                <h5 className="font-medium">
                                  Prévenir la direction générale
                                </h5>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Informer le PDG et le comité de direction de la
                                situation actuelle
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Échéance : Dans 15 minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1">
                              Marquer comme en cours
                            </Button>
                            <Button size="sm" variant="outline">
                              Ajouter un commentaire
                            </Button>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="default">EN COURS</Badge>
                                <h5 className="font-medium">
                                  Rédiger le communiqué presse
                                </h5>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Préparer une communication officielle pour les
                                médias
                              </p>
                              <div className="text-xs bg-blue-100 dark:bg-blue-900 p-2 rounded mt-2">
                                <p className="font-medium mb-1">
                                  💬 Votre commentaire (il y a 5 min):
                                </p>
                                <p>
                                  &quot;Brouillon terminé, en attente de
                                  validation par la direction&quot;
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 bg-green-600"
                            >
                              Marquer comme terminée
                            </Button>
                            <Button size="sm" variant="outline">
                              Modifier le commentaire
                            </Button>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 opacity-75">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <h5 className="font-medium">
                              Identifier les clients prioritaires
                            </h5>
                            <Badge className="bg-green-600 ml-auto">
                              ✓ TERMINÉE
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Liste de 15 clients VIP établie et validée
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Team chat simulation */}
                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Communication d&apos;Équipe
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded">
                          <p className="font-medium">
                            Marie (Équipe IT) • il y a 2 min
                          </p>
                          <p className="text-muted-foreground">
                            Le réseau est maintenant isolé. On peut commencer la
                            restauration.
                          </p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                          <p className="font-medium">Vous • il y a 1 min</p>
                          <p>
                            Parfait, j&apos;informe la direction que nous
                            pouvons démarrer la procédure de récupération.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          1. Création de Scénarios
                        </CardTitle>
                        <CardDescription>
                          Définissez le cadre de l&apos;exercice
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Créez des scénarios de crise réalistes avec :
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>
                          <strong>Contexte</strong> : Cyberattaque, panne,
                          catastrophe naturelle
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>
                          <strong>Objectifs</strong> : Compétences à tester et
                          valider
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>
                          <strong>Durée</strong> : De quelques heures à
                          plusieurs jours
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          2. Tâches et Injections
                        </CardTitle>
                        <CardDescription>
                          Créez le contenu de l&apos;exercice
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Tâches</h4>
                        <p className="text-xs text-muted-foreground">
                          Assignez des actions aux équipes avec des échéances et
                          des responsables
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">
                          Injections
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Emails, appels, alertes système pour dynamiser
                          l&apos;exercice
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          3. Exécution et Suivi
                        </CardTitle>
                        <CardDescription>
                          Pilotez l&apos;exercice en temps réel
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Vue Animateur</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>
                              Tableau de bord complet de la simulation
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>Déclenchement manuel des injections</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>Suivi en temps réel de la progression</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Vue Participant</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span>Liste des tâches assignées</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span>Mise à jour du statut des actions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span>Commentaires et collaboration</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Teams Module Demo */}
            <TabsContent value="teams" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">
                  Gestion des Utilisateurs et Équipes
                </h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Organisez vos collaborateurs et contrôlez les accès de manière
                  efficace
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Gestion par Rôles
                        </CardTitle>
                        <CardDescription>
                          Sécurisez l&apos;accès aux fonctionnalités
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">ADMIN</Badge>
                          <h4 className="font-semibold text-sm">
                            Administrateur
                          </h4>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Accès complet à toutes les fonctionnalités</li>
                          <li>• Gestion des utilisateurs et équipes</li>
                          <li>• Création et animation de simulations</li>
                          <li>• Consultation de tous les rapports</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">USER</Badge>
                          <h4 className="font-semibold text-sm">Utilisateur</h4>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Création de rapports BIA personnels</li>
                          <li>• Participation aux simulations</li>
                          <li>• Gestion de ses propres tâches</li>
                          <li>• Consultation de son tableau de bord</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Création d&apos;Équipes
                        </CardTitle>
                        <CardDescription>
                          Organisez vos collaborateurs
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Créez des équipes pour faciliter l&apos;assignation :
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm">
                          Équipe de Crise IT
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          5 membres • Cybersécurité
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm">
                          Cellule de Communication
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          3 membres • Relations publiques
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                        <h4 className="font-semibold text-sm">
                          Direction de Crise
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          4 membres • Décision stratégique
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Authentification Flexible
                    </CardTitle>
                    <CardDescription>
                      Plusieurs options de connexion pour vos utilisateurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Email / Mot de passe
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Inscription classique avec validation par email et
                          gestion sécurisée des mots de passe
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Connexion Google
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Authentification OAuth2 pour une connexion rapide et
                          sécurisée avec un compte Google
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Technologies Utilisées</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une pile technologique moderne et robuste pour une performance
            optimale
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Frontend</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js 15</li>
                <li>• React 19</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Backend</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js API Routes</li>
                <li>• Prisma ORM</li>
                <li>• MongoDB</li>
                <li>• Server Actions</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Authentification</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• NextAuth.js</li>
                <li>• OAuth2 (Google)</li>
                <li>• Credentials</li>
                <li>• Session JWT</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Services</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Google Gemini</li>
                <li>• Twilio SMS</li>
                <li>• Nodemailer</li>
                <li>• Recharts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à renforcer la résilience de votre organisation ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Commencez dès aujourd&apos;hui avec un compte gratuit et découvrez
            toutes les fonctionnalités de S.U.R.V.I.V.E. Resilience
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Créer un compte gratuit</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/connection">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            © 2025 S.U.R.V.I.V.E. Resilience. Plateforme de Continuité
            d&apos;Activité et de Gestion de Crise.
          </p>
          <p className="text-xs italic text-slate-400 mt-2">
            &quot;When the going gets tough, the tough get going&quot;
          </p>
        </div>
      </footer>
    </div>
  );
}
