'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Calendar, User, LogOut, LogInIcon, Heart } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'

const quickSearchOptions = [
  { title: 'Cabelo' },
  { title: 'Barba' },
  { title: 'Acabamento' },
  { title: 'Sobrancelha' },
  { title: 'Massagem' },
  { title: 'Hidratação' },
]

const navItems = [
  { label: 'Início',       href: '/',         icon: Home     },
  { label: 'Busca',        href: '/busca',    icon: Search   },
  { label: 'Agendamentos', href: '/bookings', icon: Calendar },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()

  const handleLogin = async () => {
    await authClient.signIn.social({ provider: 'google' })
  }

  const handleLogout = async () => {
    await authClient.signOut()
  }

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-100 bg-black shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <ul className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {/* Links normais */}
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all ${
                  isActive ? "text-white" : "text-gray-100 hover:text-gray-500"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span
                  className={`text-[11px] font-medium tracking-tight ${isActive ? "font-semibold" : ""}`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}

        {/* Perfil — abre o Sheet */}
        <li className="flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex w-full flex-col items-center justify-center gap-1 rounded-xl py-2 text-gray-100 transition-all hover:text-gray-500">
                <div className="relative">
                  {session?.user ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.user.image ?? ""} />
                      <AvatarFallback className="text-[10px]">
                        {session.user.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User size={22} strokeWidth={1.8} />
                  )}
                </div>
                <span className="text-[11px] font-medium tracking-tight">
                  Perfil
                </span>
              </button>
            </SheetTrigger>

            <SheetContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <SheetHeader className="border-secondary border-b border-solid p-5 text-left">
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
                      <h2 className="text-lg font-semibold">
                        Olá. Faça seu login!
                      </h2>
                    </div>
                    <Button
                      onClick={handleLogin}
                      size="icon"
                      className="rounded-full border px-13 py-3"
                    >
                      Login
                      <LogInIcon size={18} />
                    </Button>
                  </>
                )}
              </div>

              {/* Navegação no Sheet */}
              <div className="border-secondary flex flex-col gap-2 border-b border-solid px-3 py-5">
                <SheetClose asChild>
                  <Button
                    className="justify-start gap-2"
                    variant="ghost"
                    asChild
                  >
                    <Link href="/">
                      <Home size={18} />
                      Início
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    className="justify-start gap-2"
                    variant="ghost"
                    asChild
                  >
                    <Link href="/bookings">
                      <Calendar size={18} />
                      Agendamentos
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    className="justify-start gap-2"
                    variant="ghost"
                    asChild
                  >
                    <Link href="/favorites">
                      <Heart size={18} />
                      Favoritos
                    </Link>
                  </Button>
                </SheetClose>
              </div>

              {/* Categorias */}
              <div className="border-secondary flex flex-col gap-3 border-b border-solid px-3 py-5">
                {quickSearchOptions.map((option) => (
                  <SheetClose key={option.title} asChild>
                    <Button
                      className="justify-start gap-2"
                      variant="ghost"
                      asChild
                    >
                      <Link href={`/barbershops?search=${option.title}`}>
                        {option.title}
                      </Link>
                    </Button>
                  </SheetClose>
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
        </li>
      </ul>
    </nav>
  );
}
