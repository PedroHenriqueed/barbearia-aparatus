"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  barbershopId: z.string(),
  serviceId: z.string(),
  date: z.coerce.date(),
});

export const joinWaitlist = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { barbershopId, serviceId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Você precisa estar logado para ativar o aviso.");
    }

    // 1. Verifica se já está cadastrado para ser avisado
    const existingAlert = await prisma.waitlist.findFirst({
      where: {
        userId: session.user.id,
        barbershopId,
        date,
      },
    });

    if (existingAlert) {
      throw new Error("Você já ativou o aviso para este horário!");
    }

    // 2. Cadastra o aviso
    await prisma.waitlist.create({
      data: {
        userId: session.user.id,
        barbershopId,
        serviceId,
        date,
      },
    });

    revalidatePath("/");

    return { success: true };
  });
