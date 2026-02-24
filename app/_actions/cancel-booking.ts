"use server";

import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import Stripe from "stripe";

const inputSchema = z.object({
  bookingId: z.string().uuid(),
});

export const cancelBooking = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { bookingId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você precisa estar logado para cancelar uma reserva."],
      });
    }

    // Verifica se a reserva existe e pertence ao usuário
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
    });

    if (!booking) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Reserva não encontrada."],
      });
    }

    // 🔥 NOVO: Integração com o Stripe para fazer o estorno
    if (booking.paymentId) {
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error("STRIPE_SECRET_KEY is not set");
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2025-10-29.clover",
        });

        // Solicita o estorno total da cobrança usando o ID salvo
        await stripe.refunds.create({
          charge: booking.paymentId,
        });

        console.log(
          `✅ Estorno realizado com sucesso para a cobrança: ${booking.paymentId}`,
        );
      } catch (stripeError: any) {
        console.error(
          "❌ Erro ao realizar estorno no Stripe:",
          stripeError.message,
        );
        return returnValidationErrors(inputSchema, {
          _errors: ["Ocorreu um erro ao processar o estorno do pagamento."],
        });
      }
    }

    // Atualiza o status da reserva para cancelada
    await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        cancelled: true,
        cancelledAt: new Date(), // Opcional: marca a data exata do cancelamento se quiser
      },
    });

    revalidatePath("/");
    revalidatePath("/bookings");
  });
