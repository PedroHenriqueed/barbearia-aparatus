"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client"; // Assumindo que existe, o usuário usou no exemplo
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";

const inputSchema = z.object({
  serviceId: z.string().uuid(), // z.uuid() é valido, mas z.string().uuid() é mais explícito/comum em zod recentes, mas z.uuid() funciona se for string
  date: z.date(),
});

export const createBooking = actionClient
  .schema(inputSchema) // .inputSchema ou .schema dependendo da versão, o usuário usou inputSchema
  .action(async ({ parsedInput: { serviceId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      // Retornar o erro para parar a execução
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
    // Importante: date vem do cliente. O prisma compara datas com precisão.
    // Garantir que a lógica de negócio considera o intervalo de tempo se necessário (ex: 30 min).
    // Neste caso simples, a igualdade exata funciona se o frontend enviar horários exatos pré-definidos.
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

    // Criar o agendamento
    const booking = await prisma.booking.create({
      data: {
        servicesId: serviceId, // CORREÇÃO: Atribuir serviceId ao campo servicesId
        date: date,
        userId: session.user.id,
        babershopId: service.babershopId,
      },
    });

    return booking;
  });
