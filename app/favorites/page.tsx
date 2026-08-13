import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BarbershopItem from "@/app/_components/barbershop-item";

export const dynamic = "force-dynamic";

const FavoritesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/");
  }

  const userFavorites = await prisma.favorite.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      barbershop: true,
    },
  });

  const favoriteBarbershops = userFavorites.map((fav) => fav.barbershop);

  return (
    <main className="bg-background flex min-h-screen w-full flex-col pb-24">
      {/* Topo Padronizado */}
      <div className="bg-background/95 sticky top-0 z-20 px-5 pt-4 pb-2 backdrop-blur-sm">
      </div>

      {/* Conteúdo com Título Alinhado */}
      <div className="flex flex-col gap-5 px-5 pt-3">
        <h1 className="text-xl font-bold text-white">Favoritos</h1>

        {favoriteBarbershops.length > 0 ? (
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3">
            {favoriteBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            Você ainda não possui barbearias favoritadas.
          </p>
        )}
      </div>
    </main>
  );
};

export default FavoritesPage;
