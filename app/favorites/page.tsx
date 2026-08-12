import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/app/_components/header";
import BarbershopItem from "@/app/_components/barbershop-item";
import { PageContainer, PageSectionTitle } from "@/app/_components/ui/page";


export const dynamic = "force-dynamic";

const FavoritesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/");
  }

  // 1. Busca os favoritos usando 'prisma.favorite'
  const userFavorites = await prisma.favorite.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      barbershop: true,
    },
  });

  // 2. Extrai as barbearias da relação
  const favoriteBarbershops = userFavorites.map((fav) => fav.barbershop);

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />

      <div className="p-5">
        <PageContainer>
          <PageSectionTitle>Favoritos</PageSectionTitle>

          {favoriteBarbershops.length > 0 ? (
            <div className="grid-rows grid gap-4 sm:grid-cols-3 md:grid-cols-4">
              {favoriteBarbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm font-medium">
              Você ainda não possui barbearias favoritadas.
            </p>
          )}
        </PageContainer>
      </div>
    </div>
  );
};

export default FavoritesPage;
