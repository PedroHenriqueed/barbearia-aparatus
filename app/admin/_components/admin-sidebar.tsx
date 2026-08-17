"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Scissors,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Store,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Barbershop } from "@prisma/client";

export default function AdminSidebar({
  barbershop,
}: {
  barbershop: Barbershop | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Lista de páginas do nosso painel
const navItems = [
  { name: "Início", href: "/admin", icon: Home },
  { name: "Agenda do Dia", href: "/admin/agenda", icon: CalendarDays },
  { name: "Serviços", href: "/admin/services", icon: Scissors },
  { name: "Horários", href: "/admin/hours", icon: Clock },
  { name: "Perfil da Barbearia", href: "/admin/settings", icon: Settings },
];

  return (
    <>


      {/* OVERLAY ESCURO NO CELULAR */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* BARRA LATERAL */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* CABEÇALHO DA BARRA LATERAL */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Store size={20} />
            </div>
            <div>
              <h2 className="line-clamp-1 text-sm font-bold text-white">
                {barbershop?.name || "Minha Barbearia"}
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Portal do Parceiro
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* MENU DE NAVEGAÇÃO */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* RODAPÉ DO MENU */}
        <div className="border-t border-zinc-800 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 transition-all hover:bg-zinc-900 hover:text-white"
          >
            <ArrowLeft size={18} />
            Voltar para o App
          </Link>
        </div>
      </aside>
    </>
  );
}
