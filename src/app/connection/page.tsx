"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      setIsLoading(false);

      if (result?.error) {
        toast({
          title: "Erreur de connexion",
          description: "Identifiants invalides. Veuillez réessayer.",
          variant: "destructive",
        });
      } else {
        const callbackUrl = searchParams.get("callbackUrl");
        const session = await getSession();

        toast({
          title: "Connexion réussie",
          description: "Redirection en cours...",
        });

        // Redirect based on callbackUrl or user role
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (session?.user?.role === "USER") {
          router.push("/profile");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Erreur lors de la connexion:", error);
      toast({
        title: "Erreur inattendue",
        description:
          "Une erreur est survenue lors de la tentative de connexion.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Switch thème en haut à droite */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Colonne gauche : image de fond avec overlay */}
      <div className="relative hidden lg:flex flex-col justify-between bg-muted text-white dark:border-r">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
            alt="Risk Management Illustration"
            fill
            className="object-cover w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
        </div>
        <div className="relative z-10 flex items-center p-8 pt-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3 h-7 w-7 text-primary-foreground"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          <span className="text-2xl font-bold tracking-tight">
            S.U.R.V.I.V.E. Resilience
          </span>
        </div>
        <div className="relative z-10 p-8 pb-10">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium">
              &ldquo;Cette plateforme a complètement transformé notre gestion de
              crise. La préparation est plus efficace et notre résilience
              organisationnelle s&apos;est considérablement améliorée.&rdquo;
            </p>
            <footer className="text-sm opacity-80">
              Sofia Davis - Responsable Continuité d&apos;Activité
            </footer>
          </blockquote>
        </div>
      </div>
      {/* Colonne droite : formulaire */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md mx-auto flex flex-col gap-8">
          {/* Logo ou icône */}
          <div className="flex justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <div className="bg-card/80 dark:bg-card/80 rounded-2xl shadow-xl p-8 border border-border text-foreground backdrop-blur-md">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight mb-1">
                Connexion à votre compte
              </h1>
              <p className="text-muted-foreground text-base">
                Entrez vos identifiants pour vous connecter
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="exemple@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="votre mot de passe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="flex flex-col gap-2 mt-6">
              <Link
                href="/password-reset"
                className="text-sm text-primary hover:underline text-center"
              >
                Mot de passe oublié ?
              </Link>
              <p className="text-center text-base text-muted-foreground mt-2">
                Pas encore de compte ?{" "}
                <Link
                  href="/signup"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
