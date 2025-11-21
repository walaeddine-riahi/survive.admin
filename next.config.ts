import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
    // Désactiver l'optimisation pour toutes les images (recommandé pour /media/)
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclure canvas du bundle (native bindings incompatibles)
    // canvas est une dépendance optionnelle de pdfjs-dist
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Externaliser canvas côté serveur pour Netlify
    if (isServer) {
      // Marquer canvas comme externe pour éviter de le bundler
      const externals = [...(config.externals || [])];
      config.externals = [...externals, "canvas", { canvas: "canvas" }];
    }

    // Ignorer les erreurs de résolution pour canvas
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/canvas/ },
    ];

    return config;
  },
};

export default nextConfig;
