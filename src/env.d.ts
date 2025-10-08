/// <reference types="@t3-oss/env-nextjs/v16" />

// Déclaration de type pour le module env.mjs
declare module "@/env.mjs" {
  export const env: {
    NODE_ENV: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL?: string;
    DATABASE_URL: string;
    RAPIDAPI_KEY?: string;
    RESEND_API_KEY?: string;
    NEXT_PUBLIC_APP_URL?: string;
  };
}
