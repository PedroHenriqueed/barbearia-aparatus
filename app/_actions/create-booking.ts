"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

const inputSchema = z.object({
  // 1. Removido o .uuid() para aceitar os CUIDs gerados pelo Prisma
  serviceId: z.string().min(1, "Serviço inválido"),
  date: z.coerce.date(),
});

export const createInPersonBooking = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    // 2. Verifica se existe um agendamento ativo (não cancelado) para o mesmo horário
    const existingBooking = await prisma.booking.findFirst({
      where: {
        babershopId: service.babershopId,
        date: date,
        cancelled: false, // Ignora agendamentos que já foram cancelados
      },
    });

    if (existingBooking) {
      throw new Error(
        "Este horário acabou de ser preenchido por outro cliente.",
      );
    }

    // 3. Cria o agendamento presencial
    const booking = await prisma.booking.create({
      data: {
        servicesId: serviceId,
        date: date,
        userId: session.user.id,
        babershopId: service.babershopId,
        paymentMethod: PaymentMethod.IN_PERSON,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    return booking;
  });
