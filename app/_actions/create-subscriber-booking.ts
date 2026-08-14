"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  serviceId: z.string(),
  date: z.coerce.date(),
});

export const createSubscriberBooking = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado.");
    }

    const service = await prisma.barbershopService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    // Valida no backend se o usuário possui assinatura ativa nesta barbearia
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        plan: {
          barbershopId: service.babershopId,
        },
      },
    });

    if (!subscription) {
      throw new Error("Nenhuma assinatura ativa encontrada nesta barbearia.");
    }

    // Cria o agendamento já marcado como PAGO via assinatura
    await prisma.booking.create({
      data: {
        date: date,
        paymentMethod: PaymentMethod.SUBSCRIPTION,
        paymentStatus: PaymentStatus.PAID,
        user: {
          connect: { id: session.user.id },
        },
        service: {
          connect: { id: serviceId },
        },
        barbershop: {
          connect: { id: service.babershopId },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath(`/barbershops/${service.babershopId}`);

    return { success: true };
  });