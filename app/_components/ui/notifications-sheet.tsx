"use client";

import { useState } from "react";
import { Bell, Tag, Clock, CalendarCheck, CheckCheck } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Badge } from "@/app/_components/ui/badge";
import { markAllNotificationsAsRead } from "@/app/_actions/notifications";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "PROMOTION" | "REMINDER_24H" | "REMINDER_2H";
  read: boolean;
  createdAt: Date;
}

interface NotificationsSheetProps {
  notifications: NotificationItem[];
}

export const NotificationsSheet = ({
  notifications: initialNotifications,
}: NotificationsSheetProps) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [prevInitialNotifications, setPrevInitialNotifications] =
    useState(initialNotifications);

  // 🔹 Sincroniza o estado durante a renderização quando as props mudarem (sem useEffect)
  if (initialNotifications !== prevInitialNotifications) {
    setPrevInitialNotifications(initialNotifications);
    setNotifications(initialNotifications);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead();
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "PROMOTION":
        return <Tag className="h-4 w-4 text-zinc-400" />;
      case "REMINDER_24H":
        return <CalendarCheck className="h-4 w-4 text-zinc-400" />;
      case "REMINDER_2H":
        return <Clock className="h-4 w-4 text-zinc-400" />;
      default:
        return <Bell className="text-primary h-4 w-4" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full p-0 text-white hover:text-zinc-300"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[340px] border-zinc-800 bg-zinc-950 p-0 text-white sm:w-[380px]"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-zinc-800 p-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base font-bold text-white">
              Notificações
            </SheetTitle>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-zinc-800 text-xs text-zinc-300"
              >
                {unreadCount} nova(s)
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-0 text-xs text-zinc-400 hover:text-white"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Lidas
            </Button>
          )}
        </SheetHeader>

        <div className="flex max-h-[calc(100vh-80px)] flex-col divide-y divide-zinc-900 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <Bell className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-xs">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`flex gap-3 p-4 transition-colors ${
                  !item.read ? "bg-zinc-900/40" : "bg-transparent opacity-70"
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                  {getNotificationIcon(item.type)}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-semibold text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
