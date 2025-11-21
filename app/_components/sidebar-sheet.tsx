"use client";

import { Button } from "./ui/button";
import { Calendar, Home, LogOut, LogInIcon } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authClient } from "@/lib/auth-client";


interface SidebarSheetProps {
  children: React.ReactNode;
}

export default function SidebarSheet({ children }: SidebarSheetProps) {
  const { data: session } = authClient.useSession();

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  // Opções de serviços estáticas conforme o design
  const quickSearchOptions = [
    { title: "Cabelo" },
    { title: "Barba" },
    { title: "Acabamento" },
    { title: "Sobrancelha" }, 
    { title: "Massagem" },
    { title: "Hidratação" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <SheetHeader className="p-5 text-left border-b border-solid border-secondary">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        {/* Seção do Usuário */}
        <div className="flex items-center gap-3 border-solid px-3 py-3">
          {session?.user ? (
            <>
              <Avatar>
                <AvatarImage src={session.user.image ?? ""} />
                <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-bold">{session.user.name}</p>
                <p className="text-muted-foreground text-xs">
                  {session.user.email}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Olá. Faça seu login!</h2>
              </div>
              <Button onClick={handleLogin} size="icon" className="px-13 py-3 border rounded-full">
                Login
                <LogInIcon size={18} />
              </Button>
            </>
          )}
        </div>

        {/* Navegação Principal */}
        <div className="border-secondary flex flex-col gap-2 border-b border-solid px-3 py-5">
          <SheetClose asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href="/">
                <Home size={18} />
                Início
              </Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href="">
                <Calendar size={18} />
                Agendamentos
              </Link>
            </Button>
          </SheetClose>
        </div>

        {/* Categorias de Serviços */}
        <div className="border-secondary flex flex-col gap-2 border-b border-solid px-3 py-5">
          {quickSearchOptions.map((option) => (
            <Button
              key={option.title}
              className="justify-start gap-2"
              variant="ghost"
            >
              {option.title}
            </Button>
          ))}
        </div>

        {/* Logout */}
        {session?.user && (
          <div className="flex flex-col gap-2 px-3 py-5">
            <Button
              variant="ghost"
              className="justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sair da conta
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
