"use server";

import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";


export const getDateAvailableTimeSlots = async ({
  babershopId,
  date,
}: {
  babershopId: string;
  date: Date;
}) => {

  // Busca todos os agendamentos para aquele dia e barbearia
  const bookings = await prisma.booking.findMany({
    where: {
      babershopId,
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  });

  // Todos os horários possíveis
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
  // Filtra os horários
  const availableTimeSlots = timeSlots.filter((time) => {
    const [hour, minute] = time.split(":").map(Number);

    // Verifica se existe agendamento neste horário
    // Nota: Ajuste a lógica de fuso horário se necessário.
    // Aqui assumimos que booking.date.getHours() retorna a hora compatível com o que foi salvo.
    const hasBooking = bookings.some((booking) => {
      const bookingHour = booking.date.getHours();
      const bookingMinute = booking.date.getMinutes();

      return bookingHour === hour && bookingMinute === minute;
    });

    
    if (hasBooking) {
      return false;
    }

    // Verifica se o horário já passou (apenas se a data selecionada for hoje)
    const now = new Date();
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);

    // Se for o mesmo dia, bloqueia horários passados
    if (
      now.getDate() === slotDate.getDate() &&
      now.getMonth() === slotDate.getMonth() &&
      now.getFullYear() === slotDate.getFullYear()
    ) {
      if (now > slotDate) {
        return false;
      }
    }

    return true;
  });

  return availableTimeSlots;
};
