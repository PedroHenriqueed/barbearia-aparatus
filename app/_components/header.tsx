import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { NotificationsSheet } from "./ui/notifications-sheet";
import { getUserNotifications } from "@/app/_actions/notifications";
import UserMenuSheet from "./user-menu-sheet";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const notifications = await getUserNotifications();

  // Busca se o usuário possui uma barbearia vinculada
  const userBarbershop = session?.user
    ? await db.barbershop.findFirst({
        where: { userId: session.user.id },
      })
    : null;

  return (
    <header className="flex h-10 w-full items-center justify-between bg-transparent">
      {/* ── Extrema Esquerda: Logo Trivo ── */}
      <Link href="/" className="flex items-center">
        <Image
          src="/trivo_logo.png"
          alt="Trivo"
          height={20}
          width={90}
          className="h-8 w-auto object-contain invert"
        />
      </Link>

      {/* ── Extrema Direita: Notificações + Avatar ── */}
      <div className="flex items-center gap-3">
        <NotificationsSheet notifications={notifications as any} />

      </div>
    </header>
  );
}
