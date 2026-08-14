"use server";

import { prisma } from "@/lib/prisma";

export interface TimeSlot {
  time: string;
  available: boolean;
  isBooked: boolean;
  isPast: boolean;
  waitlistCount: number;
}

// 🛡️ Converte qualquer data/horário do servidor (UTC) para o fuso oficial do Brasil
const getBrazilDateInfo = (dateInput: Date | string) => {
  const d = new Date(dateInput);
  const brString = d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  const brDate = new Date(brString);

  const year = brDate.getFullYear();
  const month = String(brDate.getMonth() + 1).padStart(2, "0");
  const day = String(brDate.getDate()).padStart(2, "0");
  const hours = String(brDate.getHours()).padStart(2, "0");
  const minutes = String(brDate.getMinutes()).padStart(2, "0");

  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: `${hours}:${minutes}`,
  };
};

export const getDateAvailableTimeSlots = async ({
  babershopId,
  date,
}: {
  babershopId: string;
  date: Date | string;
}): Promise<TimeSlot[]> => {
  const targetBR = getBrazilDateInfo(date);

  // Busca agendamentos em um intervalo amplo para cobrir diferenças de fuso
  const inputDateObj = new Date(date);
  const startRange = new Date(inputDateObj);
  startRange.setDate(startRange.getDate() - 2);
  const endRange = new Date(inputDateObj);
  endRange.setDate(endRange.getDate() + 2);

  const [bookings, waitlists] = await Promise.all([
    prisma.booking.findMany({
      where: {
        babershopId,
        date: { gte: startRange, lte: endRange },
        cancelled: false,
      },
    }),
    prisma.waitlist.findMany({
      where: {
        barbershopId: babershopId,
        date: { gte: startRange, lte: endRange },
        status: { in: ["WAITING", "NOTIFIED"] },
      },
    }),
  ]);

  // Mapeia os horários ocupados convertidos para o fuso do Brasil
  const bookedTimes = new Set<string>();
  bookings.forEach((b) => {
    const bBR = getBrazilDateInfo(b.date);
    if (bBR.dateStr === targetBR.dateStr) {
      bookedTimes.add(bBR.timeStr);
    }
  });

  // Mapeia as filas de espera
  const waitlistTimes: string[] = [];
  waitlists.forEach((w) => {
    const wBR = getBrazilDateInfo(w.date);
    if (wBR.dateStr === targetBR.dateStr) {
      waitlistTimes.push(wBR.timeStr);
    }
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

  const nowBR = getBrazilDateInfo(new Date());

  return timeSlots.map((time) => {
    const [hour, minute] = time.split(":").map(Number);

    // Marca como ocupado se o horário do Brasil bater com a reserva
    const isBooked = bookedTimes.has(time);

    // Verifica se já passou hoje no Brasil
    const isToday = nowBR.dateStr === targetBR.dateStr;
    const [nowH, nowM] = nowBR.timeStr.split(":").map(Number);
    const isPast =
      isToday && (nowH > hour || (nowH === hour && nowM >= minute));

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
