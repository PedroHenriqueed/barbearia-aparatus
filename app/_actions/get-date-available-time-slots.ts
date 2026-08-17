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
    dayOfWeek: brDate.getDay(), // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
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

  const inputDateObj = new Date(date);
  const startRange = new Date(inputDateObj);
  startRange.setDate(startRange.getDate() - 2);
  const endRange = new Date(inputDateObj);
  endRange.setDate(endRange.getDate() + 2);

  // Busca a configuração do dia, agendamentos e lista de espera
  const [openingHour, bookings, waitlists] = await Promise.all([
    prisma.openingHour.findFirst({
      where: {
        barbershopId: babershopId,
        dayOfWeek: targetBR.dayOfWeek,
      },
    }),
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

  // Se a barbearia não estiver configurada ou estiver fechada no dia, retorna vazio
  if (!openingHour || !openingHour.isOpen) {
    return [];
  }

  // Mapeia os horários ocupados no fuso do Brasil
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

  // Gera a lista de horários dinâmica com base no expediente e almoço
  const generatedTimeSlots: string[] = [];
  const [startH, startM] = openingHour.startTime.split(":").map(Number);
  const [endH, endM] = openingHour.endTime.split(":").map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const [lunchStartH, lunchStartM] = openingHour.lunchStart
    ? openingHour.lunchStart.split(":").map(Number)
    : [-1, -1];
  const [lunchEndH, lunchEndM] = openingHour.lunchEnd
    ? openingHour.lunchEnd.split(":").map(Number)
    : [-1, -1];

  const lunchStartMinutes =
    lunchStartH >= 0 ? lunchStartH * 60 + lunchStartM : -1;
  const lunchEndMinutes = lunchEndH >= 0 ? lunchEndH * 60 + lunchEndM : -1;

  while (currentMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (currentMinutes % 60).toString().padStart(2, "0");
    const timeStr = `${h}:${m}`;

    // Ignora se estiver no intervalo de almoço
    const isLunch =
      lunchStartMinutes >= 0 &&
      lunchEndMinutes >= 0 &&
      currentMinutes >= lunchStartMinutes &&
      currentMinutes < lunchEndMinutes;

    if (!isLunch) {
      generatedTimeSlots.push(timeStr);
    }

    currentMinutes += 30; // Intervalo de 30 minutos por agendamento
  }

  const nowBR = getBrazilDateInfo(new Date());

  return generatedTimeSlots.map((time) => {
    const [hour, minute] = time.split(":").map(Number);

    const isBooked = bookedTimes.has(time);

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
