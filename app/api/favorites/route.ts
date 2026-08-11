// app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { barbershopId } = await req.json();

    if (!barbershopId) {
      return NextResponse.json(
        { error: "barbershopId é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se já existe o favorito
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_barbershopId: {
          userId: session.user.id,
          barbershopId,
        },
      },
    });

    if (existing) {
      // Se já existe, remove (toggle off)
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false });
    } else {
      // Se não existe, cria (toggle on)
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          barbershopId,
        },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error("Erro ao salvar favorito:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
