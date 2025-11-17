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
    // Exclure canvas du bundle client (native bindings incompatibles avec le navigateur)
    // canvas est une dépendance optionnelle de pdfjs-dist utilisée uniquement côté serveur
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;
