"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Shield, User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().optional(),
  language: z.string({
    required_error: "Veuillez sélectionner une langue.",
  }),
  timezone: z.string({
    required_error: "Veuillez sélectionner un fuseau horaire.",
  }),
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  incidentAlerts: z.boolean().default(true),
});

const securityFormSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.string({
    required_error: "Veuillez sélectionner un délai de session.",
  }),
});

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      language: "fr",
      timezone: "Europe/Paris",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      incidentAlerts: true,
    },
  });

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      twoFactorAuth: false,
      sessionTimeout: "30",
    },
  });

  // Charger les données dynamiquement
  useEffect(() => {
    async function loadSettings() {
      try {
        // 1. Charger le profil depuis la base de données
        const res = await fetch("/api/users/profile");
        if (!res.ok) throw new Error("Erreur de récupération");
        const userData = await res.json();

        profileForm.reset({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || userData.profile?.phone || "",
          language: localStorage.getItem("setting_language") || "fr",
          timezone: localStorage.getItem("setting_timezone") || "Europe/Paris",
        });

        // 2. Charger les préférences de notifications du localStorage
        const emailNotifications = localStorage.getItem("notif_email") !== "false";
        const pushNotifications = localStorage.getItem("notif_push") !== "false";
        const taskReminders = localStorage.getItem("notif_tasks") !== "false";
        const incidentAlerts = localStorage.getItem("notif_incidents") !== "false";

        notificationForm.reset({
          emailNotifications,
          pushNotifications,
          taskReminders,
          incidentAlerts,
        });

        // 3. Charger la sécurité du localStorage
        const twoFactorAuth = localStorage.getItem("security_2fa") === "true";
        const sessionTimeout = localStorage.getItem("security_timeout") || "30";

        securityForm.reset({
          twoFactorAuth,
          sessionTimeout,
        });
      } catch (err) {
        console.error("Erreur lors du chargement des paramètres :", err);
        toast.error("Erreur de chargement", {
          description: "Impossible de charger vos paramètres.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [profileForm, notificationForm, securityForm]);

  // Sauvegarder le profil dans la base de données
  async function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur de mise à jour");
      }

      // Enregistrer les préférences de langue/timezone localement
      localStorage.setItem("setting_language", data.language);
      localStorage.setItem("setting_timezone", data.timezone);

      toast.success("Profil mis à jour", {
        description: "Vos informations personnelles ont été enregistrées avec succès.",
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de mise à jour", {
        description: err.message || "Impossible d'enregistrer les modifications.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  // Sauvegarder les notifications dans localStorage
  async function onNotificationSubmit(data: z.infer<typeof notificationFormSchema>) {
    setSavingNotifications(true);
    try {
      // Simuler une sauvegarde rapide
      await new Promise((resolve) => setTimeout(resolve, 600));

      localStorage.setItem("notif_email", String(data.emailNotifications));
      localStorage.setItem("notif_push", String(data.pushNotifications));
      localStorage.setItem("notif_tasks", String(data.taskReminders));
      localStorage.setItem("notif_incidents", String(data.incidentAlerts));

      toast.success("Préférences enregistrées", {
        description: "Vos paramètres de notification ont été mis à jour.",
      });
    } catch (err) {
      toast.error("Erreur", {
        description: "Impossible d'enregistrer vos préférences.",
      });
    } finally {
      setSavingNotifications(false);
    }
  }

  // Sauvegarder la sécurité dans localStorage
  async function onSecuritySubmit(data: z.infer<typeof securityFormSchema>) {
    setSavingSecurity(true);
    try {
      // Simuler une sauvegarde rapide
      await new Promise((resolve) => setTimeout(resolve, 600));

      localStorage.setItem("security_2fa", String(data.twoFactorAuth));
      localStorage.setItem("security_timeout", data.sessionTimeout);

      toast.success("Paramètres de sécurité enregistrés", {
        description: "Vos règles de sécurité ont été mises à jour.",
      });
    } catch (err) {
      toast.error("Erreur", {
        description: "Impossible d'enregistrer les paramètres de sécurité.",
      });
    } finally {
      setSavingSecurity(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-[#D97706] animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Chargement de vos paramètres...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        </div>

        <div className="grid gap-6">
          {/* Profil */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Profil personnel</CardTitle>
              </div>
              <CardDescription>
                Gérez vos informations personnelles et vos coordonnées opérationnelles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Votre prénom" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de famille</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Votre nom" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="nom@exemple.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+216 XX XXX XXX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Langue de l'interface</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une langue" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuseau horaire</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Europe/Paris">
                                Paris (UTC+1)
                              </SelectItem>
                              <SelectItem value="Europe/London">
                                Londres (UTC+0)
                              </SelectItem>
                              <SelectItem value="America/New_York">
                                New York (UTC-5)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configurez vos canaux de transmission d'alertes et de directives de crise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Notifications par email</FormLabel>
                            <FormDescription>
                              Recevoir des alertes de simulation directement par email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Notifications push</FormLabel>
                            <FormDescription>
                              Afficher des alertes push dans votre navigateur en temps réel
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="taskReminders"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Rappels de tâches</FormLabel>
                            <FormDescription>
                              Alerter lorsque des livrables de crise ou des SITREPs arrivent à échéance
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="incidentAlerts"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Injections et alertes critiques</FormLabel>
                            <FormDescription>
                              Recevoir un signal sonore et visuel instantané lors d'une nouvelle injection
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={savingNotifications}>
                    {savingNotifications && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enregistrer les préférences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Sécurité et Session</CardTitle>
              </div>
              <CardDescription>
                Paramétrez vos verrous d'accès de sécurité d'exercice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form
                  onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormField
                      control={securityForm.control}
                      name="twoFactorAuth"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>
                              Authentification à deux facteurs
                            </FormLabel>
                            <FormDescription>
                              Ajouter une couche d'accès sécurisé MFA OTP pour vos accès
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Délai d'inactivité de session</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un délai" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 heure</SelectItem>
                              <SelectItem value="120">2 heures</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Déconnexion automatique de la cellule de crise après une période d'inactivité.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={savingSecurity}>
                    {savingSecurity && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sauvegarder les règles de sécurité
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
