import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import UnauthenticatedMessage from "@/app/_components/unauthenticated-message";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, MapPinIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <main className="bg-background flex min-h-screen w-full flex-col">
        <div className="bg-background/95 sticky top-0 z-20 px-5 pt-4 pb-2 backdrop-blur-sm">
        </div>
        <UnauthenticatedMessage />
      </main>
    );
  }

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
    <main className="bg-background flex min-h-screen w-full flex-col pb-24">
      {/* Topo Padronizado */}
      <div className="bg-background/95 sticky top-0 z-20 px-5 pt-4 pb-2 backdrop-blur-sm"></div>

      {/* Conteúdo com Título Alinhado */}
      <div className="flex flex-col gap-5 px-5 pt-3">
        <h1 className="text-xl font-bold text-white">Avaliações</h1>

        {reviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4 shadow-sm"
              >
                {/* Barbearia */}
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
                      <MapPinIcon size={12} className="shrink-0 text-white" />
                      <span className="truncate">
                        {review.barbershop.address}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Estrelas + Data */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        size={15}
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

                {/* Comentário */}
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
          <div className="flex flex-1 items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-zinc-400">
              Você ainda não avaliou nenhuma barbearia.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
