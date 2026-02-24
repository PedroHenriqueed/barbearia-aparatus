import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { NextRequest } from "next/server";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
];

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const barbershopId = searchParams.get("barbershopId");
    const date = searchParams.get("date");

    if (!barbershopId || !date) {
      return Response.json(
        { error: "barbershopId e date são obrigatórios" },
        { status: 400 },
      );
    }

    const dateObj = new Date(date + "T12:00:00");

    const bookings = await prisma.booking.findMany({
      where: {
        babershopId: barbershopId,
        date: {
          gte: startOfDay(dateObj),
          lte: endOfDay(dateObj),
        },
        cancelled: false,
      },
    });

    const bookedTimes = bookings.map((b) => {
      const h = b.date.getHours().toString().padStart(2, "0");
      const m = b.date.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    });

    const now = new Date();

    const availableSlots = TIME_SLOTS.filter((time) => {
      if (bookedTimes.includes(time)) return false;

      const [hour, minute] = time.split(":").map(Number);
      const slotDate = new Date(dateObj);
      slotDate.setHours(hour, minute, 0, 0);

      const isToday =
        now.getDate() === slotDate.getDate() &&
        now.getMonth() === slotDate.getMonth() &&
        now.getFullYear() === slotDate.getFullYear();

      if (isToday && now > slotDate) return false;

      return true;
    });

    return Response.json({
      date,
      barbershopId,
      availableSlots,
      bookedSlots: bookedTimes,
      total: availableSlots.length,
    });
  } catch (error) {
    console.error("❌ Erro availability:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
};
