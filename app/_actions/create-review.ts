"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  barbershopId: z.string().min(1, "Barbearia inválida"),
  bookingId: z.string().optional(), // 👈 Permite vincular a avaliação ao agendamento
  rating: z.number().min(1, "A nota mínima é 1").max(5, "A nota máxima é 5"),
  comment: z.string().optional(),
});

export const createBarbershopRating = actionClient
  .schema(inputSchema)
  .action(
    async ({ parsedInput: { barbershopId, bookingId, rating, comment } }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new Error("Você precisa estar logado para avaliar.");
      }

      // Cria a avaliação ou atualiza se o usuário já tiver avaliado a barbearia (Upsert)
      const review = await prisma.review.upsert({
        where: {
          userId_barbershopId: {
            userId: session.user.id,
            barbershopId,
          },
        },
        update: {
          rating,
          comment,
          ...(bookingId && { bookingId }), // 👈 Atualiza o agendamento associado
        },
        create: {
          userId: session.user.id,
          barbershopId,
          bookingId, // 👈 Salva o agendamento associado
          rating,
          comment,
        },
      });

      // Revalida as páginas para atualizar a média e os cards de agendamento na hora
      revalidatePath(`/barbershops/${barbershopId}`);
      revalidatePath("/bookings");
      revalidatePath("/");

      return review;
    },
  );
