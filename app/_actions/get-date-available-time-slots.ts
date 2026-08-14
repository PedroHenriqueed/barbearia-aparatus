"use server";

import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

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

  // 3. Mapeia cada horário com seu status completo
  return timeSlots.map((time) => {
    const [hour, minute] = time.split(":").map(Number);

    // Verifica se há agendamento
    const isBooked = bookings.some((booking) => {
      const bookingHour = booking.date.getHours();
      const bookingMinute = booking.date.getMinutes();
      return bookingHour === hour && bookingMinute === minute;
    });

    // Verifica se o horário já passou hoje
    const slotDate = new Date(dateObj);
    slotDate.setHours(hour, minute, 0, 0);

    const isToday =
      now.getDate() === slotDate.getDate() &&
      now.getMonth() === slotDate.getMonth() &&
      now.getFullYear() === slotDate.getFullYear();

    const isPast = isToday && now > slotDate;

    // Conta quantas pessoas estão na fila para este horário
    const waitlistCount = waitlists.filter((w) => {
      const wHour = w.date.getHours();
      const wMinute = w.date.getMinutes();
      return wHour === hour && wMinute === minute;
    }).length;

    return {
      time,
      available: !isBooked && !isPast,
      isBooked,
      isPast,
      waitlistCount,
    };
  });
};
