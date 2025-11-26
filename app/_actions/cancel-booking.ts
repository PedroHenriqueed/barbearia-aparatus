"use server";

import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";

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

    await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        cancelled: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/bookings");
  });
