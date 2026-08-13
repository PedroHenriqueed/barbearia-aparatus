import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Header from "@/app/_components/header";
import UnauthenticatedMessage from "@/app/_components/unauthenticated-message";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, MapPinIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageSectionTitle } from "../_components/ui/page";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Se não estiver logado, exibe a tela pedindo login
  if (!session?.user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <UnauthenticatedMessage />
      </div>
    );
  }

  // 2. Busca no banco todas as avaliações feitas por este usuário
  const reviews = await prisma.review.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      barbershop: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header />

      <div className="flex flex-col gap-6 p-5">
        <PageSectionTitle>Avaliações</PageSectionTitle>

        {reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm"
              >
                {/* Cabeçalho do Card com a Barbearia */}
                <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={review.barbershop.imageUrl}
                      alt={review.barbershop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/barbershops/${review.barbershop.id}`}
                      className="truncate text-sm font-bold text-white hover:underline"
                    >
                      {review.barbershop.name}
                    </Link>
                    <p className="flex items-center gap-1 truncate text-xs text-zinc-400">
                      <MapPinIcon
                        size={12}
                        className="shrink-0 text-white"
                      />
                      <span className="truncate">
                        {review.barbershop.address}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Estrelas atribuídas e Data */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        size={16}
                        className={
                          star <= review.rating
                            ? "fill-white text-white"
                            : "text-zinc-700"
                        }
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-white">
                      {review.rating}.0
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Calendar size={12} />
                    {format(new Date(review.createdAt), "dd 'de' MMMM, yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                {/* Comentário deixado */}
                {review.comment ? (
                  <p className="rounded-xl bg-zinc-900/60 p-3 text-xs break-words text-zinc-300 italic">
                    "{review.comment}"
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    Sem comentário escrito.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            Você ainda não avaliou nenhuma barbearia.
          </p>
        )}
      </div>
    </div>
  );
}
