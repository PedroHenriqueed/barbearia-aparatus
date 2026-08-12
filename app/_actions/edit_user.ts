"use server";

import { actionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  // 👇 Removido o .url() para aceitar a imagem em Base64
  image: z.string().optional(),
  phone: z.string().min(10, "Telefone inválido.").or(z.literal("")).optional(),
});

export const updateUserProfile = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { name, image, phone } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Usuário não autenticado."],
      });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        image: image || null,
        phone: phone || null,
      },
    });

    // Revalida as rotas para o servidor puxar dados novos
    revalidatePath("/");
    revalidatePath("/bookings");
    revalidatePath("/favorites");

    return { success: true };
  });
