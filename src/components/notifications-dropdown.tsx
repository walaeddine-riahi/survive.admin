import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({ title: "Erreur", description: "Impossible de marquer la notification comme lue.", variant: "destructive" });
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "warning": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "error": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[8px] hover:bg-[var(--bg-hover)] border border-[var(--border)] relative group transition-all duration-300">
          <Bell className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-[var(--bg-surface)] rounded-[12px] border-[var(--border)] mt-2 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl">
        <div className="px-4 py-3 border-b border-[var(--border)] mb-2">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)]">Centre de Notifications</h3>
        </div>
        <ScrollArea className="h-[400px] pr-4">
          {notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3 opacity-30">
              <Bell className="h-8 w-8 text-[var(--text-muted)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Silence Radio</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-4 rounded-[8px] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors border border-transparent hover:border-[var(--border)]"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Badge variant="outline" className={cn("text-[9px] uppercase font-black tracking-tighter h-5", getNotificationColor(notification.type))}>
                      {notification.type}
                    </Badge>
                    <span className="text-[9px] font-medium text-[var(--text-muted)]">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={cn("text-[13px] font-bold transition-colors", !notification.read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                    {notification.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {notification.message}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 mt-2 border-t border-[var(--border)]">
            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-8 hover:bg-[var(--bg-hover)] rounded-[8px] text-[var(--text-secondary)] hover:text-[var(--accent)]">
              Tout marquer comme lu
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
 