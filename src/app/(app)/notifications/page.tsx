"use client";

import { NotificationCard } from "@/components/notification-card";
import { NotificationForm } from "@/components/notification-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  read?: boolean; // Ancienne propriété pour la rétrocompatibilité
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      await fetchNotifications();
      toast({
        title: "Succès",
        description: "La notification a été marquée comme lue.",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue.",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      await fetchNotifications();
      toast({
        title: "Succès",
        description: "La notification a été supprimée.",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification.",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      notification.title.toLowerCase().includes(searchLower) ||
      notification.message.toLowerCase().includes(searchLower) ||
      notification.type.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <NotificationForm onSuccess={fetchNotifications} />
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des notifications..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des notifications</CardTitle>
          <CardDescription>
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""} trouvée
            {filteredNotifications.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
