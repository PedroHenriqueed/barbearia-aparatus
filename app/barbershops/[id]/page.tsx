import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BarbershopDetails from "./_components/barbershop-details";

export const dynamic = "force-dynamic";

interface BarbershopDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BarbershopDetailsPage({
  params,
}: BarbershopDetailsPageProps) {
  const { id } = await params;

  if (!id) return notFound();

  // 1. Busca a barbearia com serviços, planos e avaliações
  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    include: {
      services: true,
      plans: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!barbershop) return notFound();

  // 2. Busca a sessão do usuário logado
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

  // 3. Calcula a média e o total das avaliações
  const reviewAvg = await prisma.review.aggregate({
    where: { barbershopId: id },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const averageScore = reviewAvg._avg.rating
    ? Number(reviewAvg._avg.rating.toFixed(1))
    : 0;

  const totalReviews = reviewAvg._count.rating || 0;

  return (
    <BarbershopDetails
      barbershop={barbershop}
      initialFavorite={isFavorite}
      averageScore={averageScore}
      totalReviews={totalReviews}
    />
  );
}
