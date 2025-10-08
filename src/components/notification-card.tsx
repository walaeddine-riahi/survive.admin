"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  read?: boolean; // Ancienne propriété pour la rétrocompatibilité
  createdAt: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const { toast } = useToast();

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{notification.title}</CardTitle>
            <CardDescription>
              {new Date(notification.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={getNotificationColor(notification.type)}
          >
            {notification.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{notification.message}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={notification.isRead || notification.read ? "secondary" : "default"}
            className={notification.isRead || notification.read ? "" : "bg-blue-500"}
          >
            {notification.isRead || notification.read ? "Lue" : "Non lue"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {!(notification.isRead || notification.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Bell className="mr-2 h-4 w-4" />
              Marquer comme lue
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-600"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
