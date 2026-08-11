// app/barbershops/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BarbershopDetails from "./_components/barbershop-details";

interface BarbershopDetailsPageProps {
  params: { id: string };
}

export default async function BarbershopDetailsPage({
  params,
}: BarbershopDetailsPageProps) {
  const { id } = await params;

  if (!id) return notFound();

  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    include: {
      services: true,
    },
  });

  if (!barbershop) return notFound();

  // 👇 Better Auth: pega a sessão passando os headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let isFavorite = false;

  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_barbershopId: {
          userId: session.user.id,
          barbershopId: barbershop.id,
        },
      },
    });
    isFavorite = !!fav;
  }

  return (
    <BarbershopDetails barbershop={barbershop} initialFavorite={isFavorite} />
  );
}
