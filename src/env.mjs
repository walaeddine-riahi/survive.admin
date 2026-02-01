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

    // Azure OpenAI
    AZURE_OPENAI_API_KEY: z.string().min(1).optional(),
    AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
    AZURE_OPENAI_DEPLOYMENT: z.string().optional(),
    AZURE_OPENAI_API_VERSION: z.string().optional(),

    // Azure Storage
    AZURE_STORAGE_CONNECTION_STRING: z.string().min(1).optional(),
    AZURE_STORAGE_CONTAINER_NAME: z.string().optional(),

    // Azure Communication Services
    AZURE_COMMUNICATION_CONNECTION_STRING: z.string().min(1).optional(),
    AZURE_COMMUNICATION_EMAIL_FROM: z.string().email().optional(),
    AZURE_COMMUNICATION_PHONE_NUMBER: z.string().optional(),

    // Configuration Twilio (rétro-compatibilité)
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
    TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),

    // Configuration Email (rétro-compatibilité)
    EMAIL_USER: z.string().email().optional(),
    EMAIL_PASS: z.string().min(1).optional(),

    // Google OAuth (optionnel)
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  },

  client: {
    // Variables côté client
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,

    // Azure
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
    AZURE_STORAGE_CONNECTION_STRING:
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
    AZURE_COMMUNICATION_CONNECTION_STRING:
      process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
    AZURE_COMMUNICATION_EMAIL_FROM: process.env.AZURE_COMMUNICATION_EMAIL_FROM,
    AZURE_COMMUNICATION_PHONE_NUMBER:
      process.env.AZURE_COMMUNICATION_PHONE_NUMBER,

    // Rétro-compatibilité
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
