"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  barbershopId: z.string().min(1, "Barbearia inválida"),
  rating: z.number().min(1, "A nota mínima é 1").max(5, "A nota máxima é 5"),
  comment: z.string().optional(),
});

export const createBarbershopRating = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { barbershopId, rating, comment } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Você precisa estar logado para avaliar.");
    }

    // Cria a avaliação ou atualiza se o usuário já tiver avaliado antes (Upsert)
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
      },
      create: {
        userId: session.user.id,
        barbershopId,
        rating,
        comment,
      },
    });

    // Revalida a página da barbearia para atualizar a média na hora
    revalidatePath(`/barbershops/${barbershopId}`);
    revalidatePath("/");

    return review;
  });
