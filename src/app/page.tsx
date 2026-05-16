"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import "./landing.css";

export default function Home() {
  const chartLineRef = useRef<SVGPathElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const statsAnimatedRef = useRef(false);

  const animateCount = useCallback(
    (el: HTMLElement | null, target: number) => {
      if (!el) return;
      let start: number | null = null;
      const duration = 1600;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (el.childNodes[0]) {
          el.childNodes[0].textContent = String(Math.round(eased * target));
        }
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    []
  );

  useEffect(() => {
    // Chart line animation
    const chartLine = chartLineRef.current;
    if (chartLine) {
      setTimeout(() => {
        chartLine.style.transition =
          "stroke-dashoffset 2.4s cubic-bezier(.4,0,.2,1)";
        chartLine.style.strokeDashoffset = "0";
        document
          .querySelectorAll(".mock-chart-wrap circle")
          .forEach((c, i) => {
            setTimeout(() => {
              (c as HTMLElement).style.opacity = "1";
              (c as HTMLElement).style.transition = "opacity .5s";
            }, 2000 + i * 250);
          });
      }, 600);
    }

    // Mockup 3D tilt on mouse move
    // Note: perspective() is set as a CSS property on .mockup-wrap, NOT in the transform string
    const mockup = mockupRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (!mockup) return;
      const rect = mockup.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalize deltas relative to viewport for smooth, consistent feel
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      const tiltY = -14 + dx * 18;   // horizontal: −23° … −5°
      const tiltX = 5 - dy * 10;     // vertical:   −5° … 15°
      // No perspective() here — it's declared on .mockup-wrap in CSS
      mockup.style.transform = `rotateY(${tiltY}deg) rotateX(${tiltX}deg) translateY(-3px)`;
    };
    document.addEventListener("mousemove", handleMouseMove);

    // Particles
    const pContainer = particlesRef.current;
    if (pContainer) {
      for (let i = 0; i < 12; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.cssText = `left:${10 + Math.random() * 80}%;bottom:${Math.random() * 40}%;--dur:${3 + Math.random() * 4}s;--delay:${Math.random() * 5}s`;
        pContainer.appendChild(p);
      }
    }

    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (
              entry.target.classList.contains("stats") &&
              !statsAnimatedRef.current
            ) {
              statsAnimatedRef.current = true;
              setTimeout(() => {
                document
                  .querySelectorAll(".stat-fill")
                  .forEach((b) => b.classList.add("animate"));
                animateCount(document.getElementById("s1"), 100);
                animateCount(document.getElementById("s2"), 91);
                animateCount(document.getElementById("s3"), 72);
              }, 300);
            }
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".obs-target").forEach((el) => observer.observe(el));

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, [animateCount]);

  return (
    <div className="landing-page">
      {/* Tabler Icons CDN */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />

      {/* ── NAV ── */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">
          <svg
            width="28"
            height="32"
            viewBox="0 0 28 32"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="hgnav"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <polygon
              points="14,0 28,8 28,24 14,32 0,24 0,8"
              fill="url(#hgnav)"
            />
            <text
              x="14"
              y="22"
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill="white"
              fontFamily="system-ui,sans-serif"
            >
              S
            </text>
          </svg>
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#FAFAF9",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              SURVIVE
            </div>
            <div
              style={{
                fontSize: "7px",
                color: "#D97706",
                letterSpacing: "0.14em",
                fontWeight: 600,
              }}
            >
              RESILIENCE
            </div>
          </div>
        </Link>

        <div className="nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#services">Services</a>
          <a href="#stats">Tarifs</a>
          <a href="#cta">À propos</a>
        </div>

        <div className="nav-actions">
          <Link href="/connection" className="btn-ghost">
            Se connecter
          </Link>
          <Link href="/signup" className="btn-orange">
            Commencer la mission
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-orb" />
        <div className="hero-orb2" />
        <div className="hero-dots" />

        <div className="hero-left">
          <div className="badge-new">
            <i
              className="ti ti-sparkles"
              style={{ fontSize: "12px" }}
              aria-hidden="true"
            />
            Nouveau : Intelligence Artificielle intégrée
          </div>
          <h1 className="hero-title">
            BE READY FOR
            <br />
            <span className="gradient-word">TOMORROW</span>
          </h1>
          <p className="hero-desc">
            Avec deux décennies d&apos;expérience, S.U.R.V.I.V.E. Resilience
            vous prépare à affronter les défis de demain grâce à son expertise
            en continuité d&apos;activité et simulation de crise.
          </p>
          <div className="hero-quote">
            &quot;When the going gets tough, the tough get going&quot;
          </div>
          <div className="cta-row">
            <Link href="/signup" className="cta-primary">
              Demander une démo{" "}
              <i
                className="ti ti-arrow-right"
                style={{ fontSize: "13px" }}
                aria-hidden="true"
              />
            </Link>
            <Link href="#cta" className="cta-secondary">
              Contact
            </Link>
          </div>
          <div className="hero-mentions">
            <span className="hero-mention">
              <i
                className="ti ti-clock"
                style={{ fontSize: "13px" }}
                aria-hidden="true"
              />
              14 jours d&apos;essai gratuit
            </span>
            <span className="hero-mention">
              <i
                className="ti ti-headphones"
                style={{ fontSize: "13px" }}
                aria-hidden="true"
              />
              Support 24/7
            </span>
          </div>
        </div>

        {/* ── MOCKUP ── */}
        <div className="mockup-wrap">
          <div className="mockup" ref={mockupRef}>

            {/* Title bar */}
            <div className="mock-top">
              <div className="mock-dot" style={{ background: "#EF4444" }} />
              <div className="mock-dot" style={{ background: "#F59E0B" }} />
              <div className="mock-dot" style={{ background: "#10B981" }} />
              <div className="mock-urlbar" />
            </div>

            {/* Body: sidebar + content */}
            <div className="mock-body">

              {/* Sidebar */}
              <div className="mock-side">
                <div className="mock-side-pill" />
                <div className="mock-side-item" />
                <div className="mock-side-item" />
                <div className="mock-side-item" />
                <div className="mock-side-item" />
              </div>

              {/* Main content */}
              <div className="mock-content">

                {/* KPI cards row */}
                <div className="mock-cards">
                  <div className="mock-card">
                    <div className="mock-num" style={{ color: "#FAFAF9" }}>14</div>
                    <div className="mock-lbl">Simulations</div>
                  </div>
                  <div className="mock-card">
                    <div className="mock-num" style={{ color: "#10B981" }}>87%</div>
                    <div className="mock-lbl">Score moy.</div>
                  </div>
                  <div className="mock-card">
                    <div className="mock-num" style={{ color: "#D97706" }}>2</div>
                    <div className="mock-lbl">Alertes</div>
                  </div>
                </div>

                {/* Chart — large, fills the rest */}
                <div className="mock-chart-wrap">
                  <svg viewBox="0 0 260 100" className="chart-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor="#D97706" stopOpacity="0.55" />
                        <stop offset="75%" stopColor="#D97706" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area fill */}
                    <path
                      d="M0,88 C20,80 35,62 55,52 C70,44 85,68 105,46 C122,26 135,38 155,34 C172,30 195,44 220,38 C238,34 250,36 260,30 L260,100 L0,100 Z"
                      fill="url(#cg)"
                    />
                    {/* Line */}
                    <path
                      ref={chartLineRef}
                      d="M0,88 C20,80 35,62 55,52 C70,44 85,68 105,46 C122,26 135,38 155,34 C172,30 195,44 220,38 C238,34 250,36 260,30"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="500"
                      strokeDashoffset="500"
                    />
                    <circle cx="105" cy="46" r="3.5" fill="#D97706" opacity="0" />
                    <circle cx="155" cy="34" r="3.5" fill="#D97706" opacity="0" />
                    <circle cx="260" cy="30" r="3.5" fill="#D97706" opacity="0" />
                  </svg>
                </div>

              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="features obs-target">
        <p className="section-label">— FONCTIONNALITÉS —</p>
        <h2 className="section-title">Fonctionnalités principales</h2>
        <p className="section-sub">
          Découvrez comment notre plateforme transforme la gestion des risques en
          une expérience fluide et efficace.
        </p>
        <div className="features-grid">
          <div
            className="feat-card obs-target"
            style={{ transitionDelay: ".05s" }}
          >
            <div className="feat-icon">
              <i className="ti ti-alert-triangle" aria-hidden="true" />
            </div>
            <div className="feat-title">Gestion des risques</div>
            <div className="feat-desc">
              Identifiez, évaluez et gérez les risques en temps réel avec notre
              interface intuitive et prédictive.
            </div>
          </div>
          <div
            className="feat-card obs-target"
            style={{ transitionDelay: ".15s" }}
          >
            <div className="feat-icon">
              <i className="ti ti-users" aria-hidden="true" />
            </div>
            <div className="feat-title">Collaboration d&apos;équipe</div>
            <div className="feat-desc">
              Travaillez efficacement en équipe avec des outils de collaboration
              intégrés et synchronisés.
            </div>
          </div>
          <div
            className="feat-card obs-target"
            style={{ transitionDelay: ".25s" }}
          >
            <div className="feat-icon">
              <i className="ti ti-chart-bar" aria-hidden="true" />
            </div>
            <div className="feat-title">Analytics avancés</div>
            <div className="feat-desc">
              Visualisez vos données avec des tableaux de bord personnalisables
              et des rapports détaillés.
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="services obs-target">
        <p className="section-label">— NOS SERVICES —</p>
        <h2 className="section-title">Nos Services</h2>
        <p className="section-sub">
          Une approche complète pour répondre à tous vos besoins en gestion des
          risques.
        </p>
        <div className="services-grid">
          <div
            className="srv-card orange obs-target"
            style={{ transitionDelay: ".05s" }}
          >
            <div className="srv-icon" style={{ background: "rgba(217,119,6,0.1)" }}>
              <i
                className="ti ti-device-desktop"
                style={{ color: "#D97706", fontSize: "22px" }}
                aria-hidden="true"
              />
            </div>
            <div className="srv-title">Logiciel de Résilience</div>
            <div className="srv-desc">
              Plateforme SaaS complète pour gérer tout le cycle de vie du risque
              et de la résilience.
            </div>
            <div className="srv-list">
              <div className="srv-item">
                <div className="check">✓</div>Gestion des incidents
              </div>
              <div className="srv-item">
                <div className="check">✓</div>Tableaux de bord en temps réel
              </div>
              <div className="srv-item">
                <div className="check">✓</div>Rapports automatisés
              </div>
            </div>
            <div className="srv-link">
              En savoir plus{" "}
              <i
                className="ti ti-arrow-right"
                style={{ fontSize: "12px" }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            className="srv-card indigo obs-target"
            style={{ transitionDelay: ".15s" }}
          >
            <div className="srv-icon" style={{ background: "rgba(99,102,241,0.1)" }}>
              <i
                className="ti ti-briefcase"
                style={{ color: "#6366F1", fontSize: "22px" }}
                aria-hidden="true"
              />
            </div>
            <div className="srv-title">Consulting</div>
            <div className="srv-desc">
              Conseil stratégique et opérationnel pour les leaders de demain.
            </div>
            <div className="srv-list">
              <div className="srv-item">
                <div className="check">✓</div>Audit de risques
              </div>
              <div className="srv-item">
                <div className="check">✓</div>Formation personnalisée
              </div>
              <div className="srv-item">
                <div className="check">✓</div>Accompagnement stratégique
              </div>
            </div>
            <div className="srv-link">
              En savoir plus{" "}
              <i
                className="ti ti-arrow-right"
                style={{ fontSize: "12px" }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            className="srv-card green obs-target"
            style={{ transitionDelay: ".25s" }}
          >
            <div className="srv-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
              <i
                className="ti ti-cpu"
                style={{ color: "#10B981", fontSize: "22px" }}
                aria-hidden="true"
              />
            </div>
            <div className="srv-title">Virtual CRO</div>
            <div className="srv-desc">
              L&apos;intelligence humaine accélérée par la technologie.
            </div>
            <div className="srv-list">
              <div className="srv-item">
                <div className="check">✓</div>Expertise à la demande
              </div>
              <div className="srv-item">
                <div className="check">✓</div>Analyse prédictive
              </div>
              <div className="srv-item">
                <div className="check">✓</div>Décision assistée par IA
              </div>
            </div>
            <div className="srv-link">
              En savoir plus{" "}
              <i
                className="ti ti-arrow-right"
                style={{ fontSize: "12px" }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="stats obs-target">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-val" id="s1">
              0<span className="stat-acc">%</span>
            </div>
            <div className="stat-lbl">Satisfaction client</div>
            <div className="stat-bar">
              <div
                className="stat-fill"
                style={{ "--w": "100%" } as React.CSSProperties}
              />
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-val" id="s2">
              0<span className="stat-acc">%</span>
            </div>
            <div className="stat-lbl">Value for money</div>
            <div className="stat-bar">
              <div
                className="stat-fill"
                style={{ "--w": "91%" } as React.CSSProperties}
              />
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-val" id="s3">
              0
            </div>
            <div className="stat-lbl">Net Promoter Score</div>
            <div className="stat-bar">
              <div
                className="stat-fill"
                style={{ "--w": "72%" } as React.CSSProperties}
              />
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-val">
              24<span className="stat-acc">/7</span>
            </div>
            <div className="stat-lbl">Support client</div>
            <div className="stat-bar">
              <div
                className="stat-fill"
                style={{ "--w": "100%" } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section id="cta" className="cta-section obs-target">
        <div className="cta-box">
          <div className="cta-orb" />
          <div className="cta-particles" ref={particlesRef} />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(217,119,6,0.1)",
              border: "1px solid rgba(217,119,6,0.3)",
              borderRadius: "20px",
              padding: "5px 14px",
              fontSize: "11px",
              fontWeight: 500,
              color: "#D97706",
              position: "relative",
              zIndex: 1,
            }}
          >
            <i
              className="ti ti-building"
              style={{ fontSize: "12px" }}
              aria-hidden="true"
            />
            Rejoignez 200+ organisations
          </div>
          <h2 className="cta-title">
            Prêt à commencer <span style={{ color: "#D97706" }}>?</span>
          </h2>
          <p className="cta-sub">
            Rejoignez des centaines d&apos;entreprises qui font confiance à
            S.U.R.V.I.V.E. Resilience pour leur gestion de la continuité
            d&apos;activité.
          </p>
          <div className="cta-btns">
            <Link
              href="/signup"
              className="cta-primary"
              style={{ fontSize: "14px", padding: "13px 28px" }}
            >
              Commencer gratuitement{" "}
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </Link>
            <Link
              href="#cta"
              className="cta-secondary"
              style={{ fontSize: "14px", padding: "13px 24px" }}
            >
              Parler à un expert
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg
                width="22"
                height="26"
                viewBox="0 0 22 26"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="hgf"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#92400E" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                <polygon
                  points="11,0 22,6 22,19 11,26 0,19 0,6"
                  fill="url(#hgf)"
                />
                <text
                  x="11"
                  y="17"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="white"
                  fontFamily="system-ui,sans-serif"
                >
                  S
                </text>
              </svg>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#FAFAF9",
                  }}
                >
                  SURVIVE
                </div>
                <div
                  style={{
                    fontSize: "7px",
                    color: "#D97706",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                  }}
                >
                  RESILIENCE
                </div>
              </div>
            </div>
            <p className="footer-desc">
              Votre partenaire de confiance pour la continuité d&apos;activité et
              la résilience organisationnelle.
            </p>
            <p className="footer-quote">
              &quot;When the going gets tough, the tough get going&quot;
            </p>
          </div>
          <div>
            <div className="footer-col-title">PRODUIT</div>
            <span className="footer-link">Fonctionnalités</span>
            <span className="footer-link">Tarifs</span>
            <span className="footer-link">Intégrations</span>
            <span className="footer-link">Mises à jour</span>
          </div>
          <div>
            <div className="footer-col-title">RESSOURCES</div>
            <span className="footer-link">Blog</span>
            <span className="footer-link">Documentation</span>
            <span className="footer-link">Guides</span>
            <span className="footer-link">Support</span>
          </div>
          <div>
            <div className="footer-col-title">ENTREPRISE</div>
            <span className="footer-link">À propos</span>
            <span className="footer-link">Carrières</span>
            <span className="footer-link">Contact</span>
            <span className="footer-link">Mentions légales</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © 2025 S.U.R.V.I.V.E. Resilience. Tous droits réservés.
          </span>
          <div className="footer-socials">
            <button className="social-btn" aria-label="GitHub">
              <i className="ti ti-brand-github" aria-hidden="true" />
            </button>
            <button className="social-btn" aria-label="LinkedIn">
              <i className="ti ti-brand-linkedin" aria-hidden="true" />
            </button>
            <button className="social-btn" aria-label="Twitter">
              <i className="ti ti-brand-x" aria-hidden="true" />
            </button>
            <button className="social-btn" aria-label="Email">
              <i className="ti ti-mail" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
