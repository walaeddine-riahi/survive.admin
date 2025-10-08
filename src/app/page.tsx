import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Facebook,
  Linkedin,
  Mail,
  Shield,
  Sparkles,
  Twitter,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 dark:bg-background/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-brand-accent dark:text-brand">
            S.U.R.V.I.V.E. Resilience
          </span>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/connection">
              <Button
                variant="ghost"
                className="text-brand hover:text-brand-accent"
              >
                Se connecter
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-brand-accent text-white hover:bg-brand-dark">
                Commencer la mission
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-brand/10 to-background dark:from-brand-dark/20 dark:to-background">
          <div className="container px-4 md:px-6 grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-lg bg-brand/10 px-3 py-1 text-sm text-brand">
                <Sparkles className="mr-2 h-4 w-4" />
                Nouveau : Intelligence Artificielle intégrée
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-brand-dark">
                BE READY FOR TOMORROW
              </h1>
              <p className="max-w-[600px] text-lg md:text-xl text-brand-dark/80">
                Avec deux décennies d&apos;expérience, S.U.R.V.I.V.E. Resilience
                vous prépare à affronter les défis de demain grâce à son
                expertise en continuité d&apos;activité et simulation de crise.
              </p>
              <p className="max-w-[600px] text-sm italic text-brand-dark/70">
                &quot;When the going gets tough, the tough get going&quot;
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full min-[400px]:w-auto bg-gradient-to-r from-brand to-brand-accent text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                  >
                    Demander une démo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-[400px]:w-auto border-brand text-brand hover:bg-brand/10"
                  >
                    Contact
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  <span>14 jours d&apos;essai gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-video rounded-lg border bg-background p-2 shadow-lg">
                <div className="absolute top-2 left-2 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                  alt="Risk Management Dashboard"
                  width={420}
                  height={320}
                  className="w-full h-full object-cover rounded-md"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-16 bg-card/80 dark:bg-card/90">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand mb-4">
                Fonctionnalités principales
              </h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Découvrez comment notre plateforme transforme la gestion des
                risques en une expérience fluide et efficace.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Shield className="h-12 w-12 text-brand mb-4" />
                <h3 className="text-xl font-bold text-brand mb-2">
                  Gestion des risques
                </h3>
                <p className="text-muted-foreground">
                  Identifiez, évaluez et gérez les risques en temps réel avec
                  notre interface intuitive.
                </p>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Users className="h-12 w-12 text-brand mb-4" />
                <h3 className="text-xl font-bold text-brand mb-2">
                  Collaboration d&apos;équipe
                </h3>
                <p className="text-muted-foreground">
                  Travaillez efficacement en équipe avec des outils de
                  collaboration intégrés.
                </p>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <BarChart3 className="h-12 w-12 text-brand mb-4" />
                <h3 className="text-xl font-bold text-brand mb-2">
                  Analytics avancés
                </h3>
                <p className="text-muted-foreground">
                  Visualisez vos données avec des tableaux de bord
                  personnalisables et des rapports détaillés.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand mb-4">
                Nos Services
              </h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Une approche complète pour répondre à tous vos besoins en
                gestion des risques.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-4 rounded-full bg-brand/10 inline-block mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
                    alt="Software"
                    width={60}
                    height={60}
                    className="text-brand rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-brand">
                  Logiciel de Résilience
                </h3>
                <p className="text-muted-foreground mb-4">
                  Plateforme SaaS complète pour gérer tout le cycle de vie du
                  risque et de la résilience.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Gestion des incidents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Tableaux de bord en temps réel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Rapports automatisés</span>
                  </li>
                </ul>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-4 rounded-full bg-brand/10 inline-block mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                    alt="Consulting"
                    width={60}
                    height={60}
                    className="text-brand rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-brand">Consulting</h3>
                <p className="text-muted-foreground mb-4">
                  Conseil stratégique et opérationnel pour les leaders de
                  demain.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Audit de risques</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Formation personnalisée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Accompagnement stratégique</span>
                  </li>
                </ul>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-4 rounded-full bg-brand/10 inline-block mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                    alt="Virtual CRO"
                    width={60}
                    height={60}
                    className="text-brand rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-brand">Virtual CRO</h3>
                <p className="text-muted-foreground mb-4">
                  Intelligence humaine accélérée par la technologie.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Expertise à la demande</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Analyse prédictive</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    <span>Décision assistée par IA</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="w-full py-16 bg-card/80 dark:bg-card/90">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-extrabold text-brand dark:text-brand-accent block mb-2">
                  100%
                </span>
                <p className="text-muted-foreground">Satisfaction client</p>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-extrabold text-brand dark:text-brand-accent block mb-2">
                  91%
                </span>
                <p className="text-muted-foreground">Value for money</p>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-extrabold text-brand dark:text-brand-accent block mb-2">
                  72
                </span>
                <p className="text-muted-foreground">Net Promoter Score</p>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-brand/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-extrabold text-brand dark:text-brand-accent block mb-2">
                  24/7
                </span>
                <p className="text-muted-foreground">Support client</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 bg-gradient-to-b from-background to-brand/10 dark:from-background dark:to-brand-dark/20">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold text-brand mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto mb-8">
              Rejoignez des centaines d&apos;entreprises qui font confiance à
              S.U.R.V.I.V.E. Resilience pour leur gestion de la continuité
              d&apos;activité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand to-brand-accent text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-brand text-brand hover:bg-brand/10"
                >
                  Parler à un expert
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 bg-background/80 dark:bg-background/90">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-brand mb-4">
                  S.U.R.V.I.V.E. Resilience
                </h3>
                <p className="text-muted-foreground text-sm">
                  Votre partenaire de confiance pour la continuité
                  d&apos;activité et la résilience organisationnelle.
                </p>
                <p className="text-xs italic text-muted-foreground mt-2">
                  &quot;When the going gets tough, the tough get going&quot;
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Produit</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Fonctionnalités
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Tarifs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Intégrations
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Mises à jour
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Ressources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Entreprise</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      À propos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Carrières
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-brand transition-colors"
                    >
                      Mentions légales
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                © 2025 S.U.R.V.I.V.E. Resilience. Tous droits réservés.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com/tonentreprise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-brand transition-colors"
                  aria-label="Visitez notre page Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/company/tonentreprise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-brand transition-colors"
                  aria-label="Visitez notre page LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/tonentreprise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-brand transition-colors"
                  aria-label="Suivez-nous sur Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="mailto:contact@survive-resilience.com"
                  className="text-muted-foreground hover:text-brand transition-colors"
                  aria-label="Envoyez-nous un email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
