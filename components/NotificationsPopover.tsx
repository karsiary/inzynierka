"use client"

import * as React from "react"
import { Check, Music2, User2, Lock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

// Przykładowe powiadomienia
const notifications = [
  {
    id: 1,
    title: "Nowy komentarz w projekcie",
    description: "Jan Kowalski skomentował fazę masteringu w projekcie 'Album 2024'",
    time: "2 min temu",
    read: false,
    type: "comment",
    icon: User2,
  },
  {
    id: 2,
    title: "Zaktualizowano projekt",
    description: "Anna Nowak dodała nowe pliki do projektu 'EP Lato'",
    time: "1 godz temu",
    read: false,
    type: "update",
    icon: Music2,
  },
  {
    id: 3,
    title: "Zmiana uprawnień",
    description: "Otrzymałeś uprawnienia administratora w projekcie 'Single 2024'",
    time: "2 godz temu",
    read: true,
    type: "permission",
    icon: Lock,
  },
  // Dodaj więcej powiadomień dla demonstracji przewijania
  ...Array.from({ length: 5 }, (_, i) => ({
    id: i + 4,
    title: "Powiadomienie",
    description: `Przykładowe powiadomienie ${i + 1}`,
    time: "3 godz temu",
    read: true,
    type: "update",
    icon: Music2,
  })),
]

export function NotificationsPopover() {
  const [unreadCount, setUnreadCount] = React.useState(() => notifications.filter((n) => !n.read).length)
  const [open, setOpen] = React.useState(false)

  const markAllAsRead = React.useCallback(() => {
    setUnreadCount(0)
    // Tu zaimplementuj logikę oznaczania jako przeczytane
  }, [])

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
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full bg-[#252422] border-b border-[#403d39] rounded-none">
            <TabsTrigger value="all" className="flex-1">
              Wszystkie
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Nieprzeczytane
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <ScrollArea className="h-[300px]">
          <div className="py-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 px-4 py-3 hover:bg-[#403d39] cursor-pointer transition-colors",
                  !notification.read && "bg-[#403d39]/50",
                )}
              >
                <div className="mt-1">
                  <notification.icon className="w-5 h-5 text-[#eb5e28]" />
                </div>
                <div className="space-y-1">
                  <p className={cn("text-sm", notification.read ? "text-[#ccc5b9]" : "text-[#fffcf2] font-medium")}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-[#ccc5b9]">{notification.description}</p>
                  <p className="text-xs text-[#ccc5b9]/70">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

