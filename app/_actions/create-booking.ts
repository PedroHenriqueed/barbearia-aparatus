"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { sendRealPushNotification } from "../_services/send-push";

const inputSchema = z.object({
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

    // 1. Busca o serviço INCLUINDO os dados da barbearia
    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        barbershop: true, // 👈 Importante: traz os dados da barbearia vinculada
      },
    });

    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    // 2. Verifica se existe um agendamento ativo para o mesmo horário
    const existingBooking = await prisma.booking.findFirst({
      where: {
        babershopId: service.babershopId,
        date: date,
        cancelled: false,
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

    const notificationTitle = "Agendamento Confirmado!";
    const notificationMessage = `Sua reserva para ${service.name} na ${service.barbershop.name} foi realizada com sucesso.`;

    // 4. Salva a notificação no banco de dados (para a gaveta/sino do app)
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: notificationTitle,
        message: notificationMessage,
        type: "REMINDER_24H",
      },
    });

    // 5. Envia o Push real no dispositivo/computador do cliente
    await sendRealPushNotification({
      userId: session.user.id,
      title: notificationTitle,
      message: notificationMessage,
      url: "/bookings",
    });

    return booking;
  });
