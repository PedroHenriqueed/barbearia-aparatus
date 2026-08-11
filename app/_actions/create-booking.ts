"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

const inputSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.date(),
});

export const createInPersonBooking = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Unauthorized"],
      });
    }

    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Service not found"],
      });
    }

    // Verificar se já existe agendamento para essa data na mesma barbearia
    const existingBooking = await prisma.booking.findFirst({
      where: {
        babershopId: service.babershopId,
        date: date,
      },
    });

    if (existingBooking) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Booking already exists"],
      });
    }

    // Criar o agendamento presencial
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