'use client';

import { usePathname } from "next/navigation";
import BottomNav from "./bottomNav";

export default function BottomNavWrapper() {
  const pathname = usePathname();

  const hiddenRoutes = ["/chat","/barbershops"]; // adicione outras rotas se precisar

  const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route));

  if (shouldHide) return null;

  return <BottomNav />;
}
