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
import { Bell, Shield, User } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Le nom d'utilisateur doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
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
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "John Doe",
      email: "john.doe@example.com",
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

  function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    console.log(data);
  }

  function onNotificationSubmit(data: z.infer<typeof notificationFormSchema>) {
    console.log(data);
  }

  function onSecuritySubmit(data: z.infer<typeof securityFormSchema>) {
    console.log(data);
  }

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Paramètres</h1>
        </div>

        <div className="grid gap-6">
          {/* Profil */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Profil</CardTitle>
              </div>
              <CardDescription>
                Gérez vos informations personnelles et préférences
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom d'utilisateur</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
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
                          <FormLabel>Langue</FormLabel>
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
                  <Button type="submit">Enregistrer les modifications</Button>
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
                Configurez vos préférences de notification
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
                              Recevez des notifications par email
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
                              Recevez des notifications push sur votre
                              navigateur
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
                              Recevez des rappels pour vos tâches
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
                            <FormLabel>Alertes d'incidents</FormLabel>
                            <FormDescription>
                              Recevez des alertes pour les incidents
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
                  <Button type="submit">Enregistrer les modifications</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Sécurité</CardTitle>
              </div>
              <CardDescription>
                Gérez vos paramètres de sécurité
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
                              Ajoutez une couche de sécurité supplémentaire à
                              votre compte
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
                          <FormLabel>Délai de session</FormLabel>
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
                            Temps d'inactivité avant déconnexion automatique
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Enregistrer les modifications</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
