"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Scissors, Clock, Settings } from "lucide-react";

export default function AdminBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Início", href: "/admin", icon: Home },
    { name: "Agenda", href: "/admin/agenda", icon: CalendarDays },
    { name: "Serviços", href: "/admin/services", icon: Scissors },
    { name: "Horários", href: "/admin/hours", icon: Clock },
    { name: "Perfil", href: "/admin/settings", icon: Settings },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t border-zinc-800/80 bg-black/95 py-2 backdrop-blur-lg md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive
                ? "font-bold text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
