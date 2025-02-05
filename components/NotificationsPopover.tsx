"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { NotificationType } from "@prisma/client"

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsPopover() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Pobieranie powiadomień...");
      const res = await fetch('/api/notifications');
      console.log("Status odpowiedzi:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Błąd odpowiedzi:", errorData);
        throw new Error(errorData.error || "Błąd podczas pobierania powiadomień");
      }

      const data = await res.json();
      console.log("Pobrane powiadomienia:", data);
      
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error("Błąd podczas pobierania powiadomień:", error);
      setError(error instanceof Error ? error.message : "Wystąpił nieznany błąd");
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobierz powiadomienia przy pierwszym renderowaniu
  React.useEffect(() => {
    fetchNotifications();
  }, []);

  // Odśwież powiadomienia przy otwarciu popovera
  React.useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const markAsRead = React.useCallback(async (id: number) => {
    try {
      console.log("Oznaczanie powiadomienia jako przeczytane:", id);
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (!res.ok) {
        throw new Error("Błąd podczas aktualizacji powiadomienia");
      }

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Błąd podczas aktualizacji powiadomienia:", error);
    }
  }, []);

  const handleNotificationClick = React.useCallback(async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      // Jeśli to powiadomienie o zespole, przekieruj na stronę /team z odpowiednim parametrem
      if (notification.type === "TEAM_INVITE" && notification.targetId) {
        router.push(`/team?openTeam=${notification.targetId}`);
      } else {
        router.push(notification.actionUrl);
      }
      setOpen(false);
    }
  }, [markAsRead, router]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative w-8 h-8 p-0">
          <Bell className="w-3.5 h-3.5 text-[#ccc5b9]" />
          {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#eb5e28] rounded-full" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-[#252422] border-[#403d39]" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#403d39]">
          <h4 className="font-medium text-[#fffcf2]">Powiadomienia</h4>
          {loading && <span className="text-xs text-[#ccc5b9]">Ładowanie...</span>}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="py-2">
            {error ? (
              <p className="p-4 text-red-500">{error}</p>
            ) : loading ? (
              <p className="p-4 text-[#ccc5b9]">Ładowanie powiadomień...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-[#fffcf2]">Brak powiadomień</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex gap-3 px-4 py-3 hover:bg-[#403d39] cursor-pointer transition-colors",
                    !notification.isRead && "bg-[#403d39]/50"
                  )}
                >
                  <div className="space-y-1 flex-1">
                    <p className={cn(
                      "text-sm",
                      notification.isRead ? "text-[#ccc5b9]" : "text-[#fffcf2] font-medium"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-[#ccc5b9]">{notification.message}</p>
                    <p className="text-xs text-[#ccc5b9]/70">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

