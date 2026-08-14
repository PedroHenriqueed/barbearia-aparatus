"use server";

import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay, format } from "date-fns";

export interface TimeSlot {
  time: string;
  available: boolean;
  isBooked: boolean;
  isPast: boolean;
  waitlistCount: number;
}

export const getDateAvailableTimeSlots = async ({
  babershopId,
  date,
}: {
  babershopId: string;
  date: Date | string;
}): Promise<TimeSlot[]> => {
  const dateObj = new Date(date);

  // 1. Busca os agendamentos ativos do dia
  const bookings = await prisma.booking.findMany({
    where: {
      babershopId: babershopId,
      date: {
        gte: startOfDay(dateObj),
        lte: endOfDay(dateObj),
      },
      cancelled: false,
    },
  });

  // 2. Busca as solicitações ativas de Fila de Espera do dia
  const waitlists = await prisma.waitlist.findMany({
    where: {
      barbershopId: babershopId,
      date: {
        gte: startOfDay(dateObj),
        lte: endOfDay(dateObj),
      },
      status: { in: ["WAITING", "NOTIFIED"] },
    },
  });

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  const now = new Date();

  // Mapeia os horários já reservados no formato "HH:mm"
  const bookedTimes = new Set(
    bookings.map((booking) => format(new Date(booking.date), "HH:mm")),
  );

  // Mapeia os horários com fila de espera no formato "HH:mm"
  const waitlistTimes = waitlists.map((w) => format(new Date(w.date), "HH:mm"));

  // 3. Mapeia cada horário com seu status correto
  return timeSlots.map((time) => {
    const [hour, minute] = time.split(":").map(Number);

    // Verifica se o horário está agendado no banco
    const isBooked = bookedTimes.has(time);

    // Verifica se o horário já passou no dia de hoje
    const slotDate = new Date(dateObj);
    slotDate.setHours(hour, minute, 0, 0);

    const isToday =
      now.getDate() === slotDate.getDate() &&
      now.getMonth() === slotDate.getMonth() &&
      now.getFullYear() === slotDate.getFullYear();

    const isPast = isToday && now > slotDate;

    // Conta quantas pessoas estão na fila para este horário
    const waitlistCount = waitlistTimes.filter(
      (wTime) => wTime === time,
    ).length;

    return {
      time,
      available: !isBooked && !isPast,
      isBooked,
      isPast,
      waitlistCount,
    };
  });
};
