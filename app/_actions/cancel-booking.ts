"use server";

import { actionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

const inputSchema = z.object({
  bookingId: z.string(), // Aceita qualquer formato de string ID
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

    // Tenta realizar o estorno no Stripe caso o agendamento tenha sido pago online
    if (booking.paymentStatus === "PAID" && booking.paymentId) {
      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

          if (booking.paymentId.startsWith("pi_")) {
            await stripe.refunds.create({
              payment_intent: booking.paymentId,
            });
          } else if (booking.paymentId.startsWith("ch_")) {
            await stripe.refunds.create({
              charge: booking.paymentId,
            });
          }
        } catch (stripeError: any) {
          console.error(
            "⚠️ Erro ao estornar no Stripe (cancelamento prosseguirá):",
            stripeError.message,
          );
        }
      }
    }

    // Marca o agendamento como cancelado no banco de dados
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        cancelled: true,
        cancelledAt: new Date(),
      },
    });

    revalidatePath("/bookings");
    revalidatePath("/");

    return { success: true };
  });
