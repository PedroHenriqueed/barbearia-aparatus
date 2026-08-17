import { prisma as db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HoursClient from "@/app/admin/hours/_components/hours-client";

export default async function AdminHoursPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect("/");

  // Busca a barbearia e os horários já salvos no banco
  const barbershop = await db.barbershop.findFirst({
    where: { userId: session.user.id },
    include: {
      openingHours: true,
    },
  });

  // Se o cara chegou aqui sem ter criado a loja, manda ele pro Perfil
  if (!barbershop) {
    return redirect("/admin/settings");
  }

  return (
    <HoursClient
      barbershopId={barbershop.id}
      initialHours={barbershop.openingHours}
    />
  );
}
