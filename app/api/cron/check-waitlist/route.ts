import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRealPushNotification } from "@/app/_services/send-push";

export async function GET() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // 1. Acha notificações expiradas (Notificado há mais de 30 min sem agendar)
  const expiredWaitlists = await prisma.waitlist.findMany({
    where: {
      status: "NOTIFIED",
      notifiedAt: {
        lte: thirtyMinutesAgo,
      },
    },
  });

  for (const item of expiredWaitlists) {
    // Marca como expirado
    await prisma.waitlist.update({
      where: { id: item.id },
      data: { status: "EXPIRED" },
    });

    // 2. Notifica o PRÓXIMO da fila (WAITING)
    const nextInLine = await prisma.waitlist.findFirst({
      where: {
        barbershopId: item.barbershopId,
        date: item.date,
        status: "WAITING",
      },
      orderBy: { createdAt: "asc" },
      include: { service: true, barbershop: true },
    });

    if (nextInLine) {
      await prisma.waitlist.update({
        where: { id: nextInLine.id },
        data: {
          status: "NOTIFIED",
          notifiedAt: new Date(),
        },
      });

      const timeString = nextInLine.date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const title = "A sua vez chegou na Fila! ⏱️";
      const message = `O horário das ${timeString} vagou! Você tem 30 minutos para confirmar.`;

      await prisma.notification.create({
        data: {
          userId: nextInLine.userId,
          title,
          message,
          type: "PROMOTION",
        },
      });

      await sendRealPushNotification({
        userId: nextInLine.userId,
        title,
        message,
        url: "/bookings",
      });
    }
  }

  return NextResponse.json({ processed: expiredWaitlists.length });
}
