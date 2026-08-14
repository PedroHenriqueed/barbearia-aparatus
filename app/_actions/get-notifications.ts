"use server";

import { prisma } from "@/lib/prisma";
import { addHours, subHours, subDays } from "date-fns";

export async function checkAndGenerateBookingReminders(userId: string) {
  const now = new Date();

  // Busca agendamentos futuros do usuário nos próximos 25 horas
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      userId,
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

    // 1. Lembrete de 24 horas (entre 23h e 25h de antecedência)
    if (timeDiffInHours >= 23 && timeDiffInHours <= 25) {
      const exists = await prisma.notification.findFirst({
        where: {
          userId,
          type: "REMINDER_24H",
          createdAt: { gte: subDays(now, 1) },
        },
      });

      if (!exists) {
        await prisma.notification.create({
          data: {
            userId,
            title: "Lembrete: Agendamento Amanhã",
            message: `Seu serviço de ${booking.service.name} na ${booking.barbershop.name} está confirmado para amanhã.`,
            type: "REMINDER_24H",
          },
        });
      }
    }

    // 2. Lembrete de 2 horas (entre 1.5h e 2.5h de antecedência)
    if (timeDiffInHours >= 1.5 && timeDiffInHours <= 2.5) {
      const exists = await prisma.notification.findFirst({
        where: {
          userId,
          type: "REMINDER_22H" as any, // ou REMINDER_2H
          createdAt: { gte: subHours(now, 3) },
        },
      });

      if (!exists) {
        await prisma.notification.create({
          data: {
            userId,
            title: "Lembrete: Agendamento em 2 Horas!",
            message: `Seu horário de ${booking.service.name} na ${booking.barbershop.name} é logo mais às ${booking.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`,
            type: "REMINDER_2H",
          },
        });
      }
    }
  }
}
