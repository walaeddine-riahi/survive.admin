import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Base
    NODE_ENV: z.enum(["development", "test", "production"]),
    
    // Authentification
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    
    // Base de données
    DATABASE_URL: z.string().url(),
    
    // API externe pour la validation des numéros
    RAPIDAPI_KEY: z.string().min(1).optional(),
    
    // Configuration pour l'envoi d'emails
    RESEND_API_KEY: z.string().min(1).optional(),
    
    // Autres variables d'environnement serveur
    // ...
  },
  
  client: {
    // Variables côté client
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    // ...
  },
  
  // Si vous utilisez des variables qui peuvent être vides ou qui ont une valeur par défaut
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  
  // Pour les variables qui doivent être présentes côté client
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
