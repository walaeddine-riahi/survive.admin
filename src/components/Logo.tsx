"use client";

import React from "react";

// Logo SURVIVE RESILIENCE — Bouclier Hexagonal
// Design System Claude · charte brun chaud + orange #D97706

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'dark' | 'light' | 'mono';

interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

const SIZES = {
  xs: { hex: 16, s: 8,  label: 14, sub: 8,  gap: 6  },
  sm: { hex: 32, s: 15, label: 15, sub: 9,  gap: 10 },
  md: { hex: 48, s: 22, label: 18, sub: 10, gap: 12 },
  lg: { hex: 72, s: 32, label: 24, sub: 12, gap: 16 },
  xl: { hex: 96, s: 44, label: 32, sub: 14, gap: 20 },
};

const VARIANTS = {
  dark: {
    hexFill:   'linear-gradient(135deg, #92400E, #D97706)',
    hexBorder: 'rgba(255,255,255,0.1)',
    sText:     '#FFFFFF',
    label:     '#FAFAF9',
    sub:       '#D97706',
    tagline:   '#57534E',
    divider:   '#3C3835',
  },
  light: {
    hexFill:   'linear-gradient(135deg, #92400E, #D97706)',
    hexBorder: 'rgba(255,255,255,0.15)',
    sText:     '#FFFFFF',
    label:     '#1C1917',
    sub:       '#92400E',
    tagline:   '#78716C',
    divider:   '#D4C5B0',
  },
  mono: {
    hexFill:   '#44403C',
    hexBorder: 'rgba(255,255,255,0.05)',
    sText:     '#A8A29E',
    label:     '#78716C',
    sub:       '#57534E',
    tagline:   '#44403C',
    divider:   '#3C3835',
  },
};

// Calcule les 6 points d'un hexagone à plat (flat-top)
function hexPoints(w: number, h: number): string {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const pts = [
    [cx,        cy - ry],
    [cx + rx,   cy - ry / 2],
    [cx + rx,   cy + ry / 2],
    [cx,        cy + ry],
    [cx - rx,   cy + ry / 2],
    [cx - rx,   cy - ry / 2],
  ];
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}

// Hexagone SVG standalone (pour favicon, avatar…)
export function LogoIcon({
  size = 'md',
  variant = 'dark',
}: Pick<LogoProps, 'size' | 'variant'>) {
  const s = SIZES[size];
  const v = VARIANTS[variant];
  const w = s.hex;
  const h = Math.round(s.hex * 1.15);
  const id = `hexGrad-${size}-${variant}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SURVIVE RESILIENCE"
    >
      <defs>
        {variant !== 'mono' && (
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        )}
      </defs>

      {/* Hexagone fond */}
      <polygon
        points={hexPoints(w, h)}
        fill={variant === 'mono' ? '#44403C' : `url(#${id})`}
      />

      {/* Contour intérieur subtil */}
      {size !== 'xs' && (
        <polygon
          points={hexPoints(w * 0.88, h * 0.88)}
          transform={`translate(${w * 0.06}, ${h * 0.06})`}
          fill="none"
          stroke={v.hexBorder}
          strokeWidth="1"
        />
      )}

      {/* Lettre S */}
      <text
        x={w / 2}
        y={h * 0.68}
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={s.s}
        fontWeight="800"
        fill={v.sText}
      >
        S
      </text>
    </svg>
  );
}

// Logo complet avec texte
export function Logo({
  size = 'md',
  variant = 'dark',
  showText = true,
  showTagline = false,
  className = '',
}: LogoProps) {
  const s = SIZES[size];
  const v = VARIANTS[variant];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        userSelect: 'none',
      }}
    >
      <LogoIcon size={size} variant={variant} />

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Ligne séparatrice entre icon et text pour md+ */}
          <span
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: s.label,
              fontWeight: 800,
              color: v.label,
              letterSpacing: '-0.025em',
              lineHeight: 1,
            }}
          >
            SURVIVE
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {/* Trait décoratif devant RESILIENCE */}
            {size !== 'xs' && size !== 'sm' && (
              <span
                style={{
                  display: 'block',
                  width: 16,
                  height: 1.5,
                  background: v.sub,
                  flexShrink: 0,
                  borderRadius: 1,
                }}
              />
            )}
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: s.sub,
                fontWeight: 600,
                color: v.sub,
                letterSpacing: '0.14em',
                lineHeight: 1,
              }}
            >
              RESILIENCE
            </span>
          </div>

          {showTagline && size !== 'xs' && size !== 'sm' && (
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: Math.max(s.sub - 1, 9),
                color: v.tagline,
                letterSpacing: '0.04em',
                marginTop: 2,
              }}
            >
              Plateforme de simulation de crise
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
