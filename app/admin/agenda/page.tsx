import { prisma as db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AgendaClient from "@/app/admin/agenda/_components/agenda-client";

export default async function AdminAgendaPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect("/");

  const barbershop = await db.barbershop.findFirst({
    where: { userId: session.user.id },
  });

  if (!barbershop) return redirect("/admin/settings");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await db.booking.findMany({
    where: {
      babershopId: barbershop.id,
      date: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      service: true,
      user: true,
    },
    orderBy: { date: "asc" },
  });

  return (
    <AgendaClient
      bookings={bookings.map((b) => ({
        id: b.id,
        date: b.date.toISOString(), // Converte para ISO String para trânsito seguro entre Server e Client
        serviceName: b.service?.name || "Serviço removido",
        priceInCents: b.service?.priceInCents || 0,
        clientName: b.user?.name || "Cliente",
        clientPhone: b.user?.phone || "Sem telefone",
        cancelled: b.cancelled || false,
      }))}
    />
  );
}
