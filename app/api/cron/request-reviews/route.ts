import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendRealPushNotification } from "@/app/_services/send-push";

export async function GET() {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const completedBookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: twoHoursAgo,
        lte: now,
      },
      cancelled: false,
      review: null,
    },
    include: {
      barbershop: true,
      service: true,
    },
  });

  let notifiedCount = 0;

  for (const booking of completedBookings) {
    const title = `Como foi seu atendimento na ${booking.barbershop.name}? `;
    const message = `Deixe sua nota para o serviço ${booking.service.name}!`;

    // 1. Evita enviar notificação duplicada caso o cron rode 2x no mesmo intervalo
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: booking.userId,
        title,
      },
    });

    if (existingNotification) continue;

    // 2. Cria a notificação interna no banco (para o sininho do app)
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title,
        message,
      },
    });

    // 3. Envia o Push Notification no celular/navegador
    await sendRealPushNotification({
      userId: booking.userId,
      title,
      message,
      url: "/bookings",
    });

    notifiedCount++;
  }

  return NextResponse.json({
    success: true,
    notified: notifiedCount,
  });
}
