"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Calendar,
  User,
  MessageSquare,
  LogOut,
  LogInIcon,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import EditUserDialog from "./edit-user-dialog";

const navItems = [
  { label: "Início", href: "/", icon: Home },
  { label: "Busca", href: "/barbershops", icon: Search },
  { label: "Agendamentos", href: "/bookings", icon: Calendar },
  { label: "TrivoIA", href: "/chat", icon: MessageSquare },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleLogin = async () => {
    await authClient.signIn.social({ provider: "google" });
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const handleOpenEditProfile = () => {
    setIsSheetOpen(false);
    setIsEditProfileOpen(true);
  };

  return (
    <>
      {/* ── BARRA FIXA NAVEGAÇÃO IGUAL À FOTO ── */}
      <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 pt-2 pb-5 backdrop-blur-md">
        <ul className="grid w-full grid-cols-5 items-center">
          {/* 4 Primeiros itens */}
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span
                    className={`truncate text-[11px] font-medium ${
                      isActive ? "font-bold text-white" : ""
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* 5º item: Perfil (Abre a Gaveta) */}
          <li className="flex justify-center">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button className="flex w-full flex-col items-center justify-center gap-1 text-zinc-400 transition-all hover:text-zinc-200">
                  <div className="relative flex items-center justify-center">
                    {session?.user ? (
                      <Avatar className="h-5 w-5 border border-zinc-700">
                        <AvatarImage src={session.user.image ?? ""} />
                        <AvatarFallback className="text-[9px]">
                          {session.user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User size={22} strokeWidth={1.8} />
                    )}
                  </div>
                  <span className="truncate text-[11px] font-medium">
                    Perfil
                  </span>
                </button>
              </SheetTrigger>

              <SheetContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                <SheetHeader className="border-b border-zinc-800 p-5 text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                {/* Topo do Menu */}
                <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-4">
                  {session?.user ? (
                    <>
                      <Avatar>
                        <AvatarImage src={session.user.image ?? ""} />
                        <AvatarFallback>
                          {session.user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <p className="truncate font-bold text-white">
                          {session.user.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {session.user.email}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex w-full items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold text-white">
                        Olá. Faça seu login!
                      </h2>
                      <Button
                        onClick={handleLogin}
                        size="sm"
                        className="gap-2 rounded-xl bg-blue-600 font-bold hover:bg-blue-700"
                      >
                        Login
                        <LogInIcon size={16} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Opções do Menu quando logado */}
                {session?.user && (
                  <div className="flex flex-col gap-2 p-4">
                    <SheetClose asChild>
                      <Button
                        className="justify-start gap-2 text-sm font-bold text-white"
                        variant="ghost"
                        asChild
                      >
                        <Link href="/">Início</Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button
                        className="justify-start gap-2 text-sm font-bold text-white"
                        variant="ghost"
                        asChild
                      >
                        <Link href="/bookings">Agendamentos</Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button
                        className="justify-start gap-2 text-sm font-bold text-white"
                        variant="ghost"
                        asChild
                      >
                        <Link href="/favorites">Favoritos</Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button
                        className="justify-start gap-2 text-sm font-bold text-white"
                        variant="ghost"
                        asChild
                      >
                        <Link href="/my-reviews">Avaliações</Link>
                      </Button>
                    </SheetClose>

                    <Button
                      className="justify-start gap-2 text-sm font-bold text-white"
                      variant="ghost"
                      onClick={handleOpenEditProfile}
                    >
                      Editar Perfil
                    </Button>

                    <div className="mt-2 border-t border-zinc-800 pt-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} />
                        Sair da conta
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>

      {/* Modal de Edição de Perfil */}
      {session?.user && (
        <EditUserDialog
          user={{
            id: session.user.id,
            name: session.user.name || "",
            email: session.user.email || "",
            image: session.user.image,
            phone: (session.user as any).phone,
          }}
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
        />
      )}
    </>
  );
}
