"use server";

import { actionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { set } from "date-fns";
import Stripe from "stripe";
import { sendRealPushNotification } from "@/app/_services/send-push";

const inputSchema = z.object({
  bookingId: z.string(),
});

export const cancelBooking = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { bookingId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Não autorizado."],
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        barbershop: true,
      },
    });

    if (!booking) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Agendamento não encontrado."],
      });
    }

    if (booking.userId !== session.user.id) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para cancelar este agendamento."],
      });
    }

    if (booking.paymentStatus === "PAID" && booking.paymentId) {
      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          if (booking.paymentId.startsWith("pi_")) {
            await stripe.refunds.create({ payment_intent: booking.paymentId });
          } else if (booking.paymentId.startsWith("ch_")) {
            await stripe.refunds.create({ charge: booking.paymentId });
          }
        } catch (stripeError: any) {
          console.error("⚠️ Erro ao estornar no Stripe:", stripeError.message);
        }
      }
    }

    // 1. Marca como cancelado
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        cancelled: true,
        cancelledAt: new Date(),
      },
    });

    // 🔹 Normaliza a data para garantir comparação exata no banco
    const normalizedDate = set(new Date(booking.date), {
      seconds: 0,
      milliseconds: 0,
    });

    // 2. Busca TODOS os usuários que pediram para ser avisados
    const interestedUsers = await prisma.waitlist.findMany({
      where: {
        barbershopId: booking.babershopId,
        date: normalizedDate,
      },
    });

    if (interestedUsers.length > 0) {
      const timeString = normalizedDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const title = "Horário Liberado!";
      const message = `O horário das ${timeString} na ${booking.barbershop.name} está disponível! Acesse o app para agendar.`;

      for (const userAlert of interestedUsers) {
        // Grava no sino de notificações
        await prisma.notification.create({
          data: {
            userId: userAlert.userId,
            title,
            message,
            type: "PROMOTION",
          },
        });

        // Envia notificação Push nativa
        await sendRealPushNotification({
          userId: userAlert.userId,
          title,
          message,
          url: `/barbershops/${booking.babershopId}?serviceId=${booking.servicesId}`,
        });
      }

      // 3. Limpa as solicitações de alerta para este horário
      await prisma.waitlist.deleteMany({
        where: {
          barbershopId: booking.babershopId,
          date: normalizedDate,
        },
      });
    }

    revalidatePath("/bookings");
    revalidatePath("/");

    return { success: true };
  });
