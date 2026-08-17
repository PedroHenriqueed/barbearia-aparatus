"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, X, Store, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";

interface UserMenuSheetProps {
  user?: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
  hasBarbershop?: boolean;
  children: React.ReactNode;
}

export default function UserMenuSheet({
  user,
  hasBarbershop,
  children,
}: UserMenuSheetProps) {
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Agendamentos", href: "/bookings" },
    { label: "Favoritos", href: "/favorites" },
    { label: "Avaliações", href: "/reviews" },
    { label: "Assinatura", href: "/subscription" },
    { label: "Editar Perfil", href: "/profile" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-[85%] max-w-[360px] flex-col justify-between border-l border-zinc-800 bg-black p-6 text-white [&>button]:hidden"
      >
        <div>
          <SheetHeader className="flex flex-row items-center justify-between border-b border-zinc-800/80 pb-4 text-left">
            <SheetTitle className="text-lg font-bold text-white">
              Menu
            </SheetTitle>
            <SheetClose className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-white transition-all hover:bg-zinc-800">
              <X size={16} />
            </SheetClose>
          </SheetHeader>

          {user ? (
            <div className="flex items-center gap-3 border-b border-zinc-800/80 py-4">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                <Image
                  src={user.image || "/avatar-placeholder.png"}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-white">
                  {user.name}
                </span>
                <span className="truncate text-xs font-medium text-zinc-400">
                  {user.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="border-b border-zinc-800/80 py-4">
              <span className="text-sm font-bold text-white">
                Olá, faça seu login!
              </span>
            </div>
          )}

          {/* BOTÃO DE ACESSO AO PAINEL DO BARBEIRO */}
          {user && (
            <div className="border-b border-zinc-800/80 py-4">
              <SheetClose asChild>
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 rounded-2xl p-3.5 text-xs font-bold transition-all ${
                    hasBarbershop
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "border border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  {hasBarbershop ? (
                    <>
                      <Store size={18} className="shrink-0 text-emerald-400" />
                      <div className="flex flex-col">
                        <span>Painel da Barbearia</span>
                        <span className="text-[10px] font-normal text-zinc-400">
                          Gerenciar sua agenda e loja
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="shrink-0 text-amber-400" />
                      <div className="flex flex-col">
                        <span>Cadastre sua Barbearia</span>
                        <span className="text-[10px] font-normal text-zinc-400">
                          Gerencie cortes e horários aqui
                        </span>
                      </div>
                    </>
                  )}
                </Link>
              </SheetClose>
            </div>
          )}

          <nav className="flex flex-col gap-4 py-5">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-bold text-white transition-colors hover:text-zinc-300"
                >
                  {link.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </div>

        {user && (
          <div className="border-t border-zinc-800/80 pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-bold text-rose-500 transition-opacity hover:opacity-80"
            >
              <LogOut size={18} />
              Sair da conta
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
