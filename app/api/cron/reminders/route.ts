import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRealPushNotification } from "@/app/_services/send-push";
import { addHours, subHours, subDays } from "date-fns";

export async function GET() {
  const now = new Date();

  // Busca agendamentos das próximas 25 horas
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      cancelled: false,
      date: {
        gte: now,
        lte: addHours(now, 25),
      },
    },
    include: {
      service: true,
      barbershop: true,
    },
  });

  for (const booking of upcomingBookings) {
    const timeDiffInHours =
      (booking.date.getTime() - now.getTime()) / (1000 * 60 * 60);

    // 🔔 Lembrete de 24h
    if (timeDiffInHours >= 23 && timeDiffInHours <= 25) {
      await sendRealPushNotification({
        userId: booking.userId,
        title: "Lembrete: Agendamento Amanhã 🗓️",
        message: `Amanhã você tem ${booking.service.name} na ${booking.barbershop.name}.`,
        url: "/bookings",
      });
    }

    // 🔔 Lembrete de 2h
    if (timeDiffInHours >= 1.5 && timeDiffInHours <= 2.5) {
      await sendRealPushNotification({
        userId: booking.userId,
        title: "Seu horário é em 2 horas! ⏰",
        message: `Seu corte na ${booking.barbershop.name} é logo mais às ${booking.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`,
        url: "/bookings",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
