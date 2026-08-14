import Image from "next/image";
import Link from "next/link";
import { NotificationsSheet } from "./ui/notifications-sheet";
import { getUserNotifications } from "@/app/_actions/notifications";

export default async function Header() {
  const notifications = await getUserNotifications();

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

      {/* ── Extrema Direita: Sino de Notificações ── */}
      <NotificationsSheet notifications={notifications as any} />
    </header>
  );
}
