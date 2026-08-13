import SearchInput from "../_components/search-input";
import BarbershopItem from "../_components/barbershop-item";
import { prisma } from "@/lib/prisma";
import BottomNav from "../_components/bottomNav";
import { PageSectionTitle } from "../_components/ui/page";

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function BarbershopsPage({
  searchParams,
}: BarbershopsPageProps) {
  // Obrigatório dar await no searchParams nas versões mais recentes do Next.js
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search?.trim() || "";

  // Busca barbearias que possuem algum SERVIÇO com o nome pesquisado,
  // ou onde o próprio nome da barbearia coincida com o termo de pesquisa.
  const barbershops = await prisma.barbershop.findMany({
    where: {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          services: {
            some: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
  });

  return (
    <main className="bg-background flex min-h-screen w-full flex-col pb-24">
      {/* ── 1. CABEÇALHO STICKY PADRÃO (Header + Busca) ── */}
      <div className="border-border bg-background/95 sticky top-0 z-20 flex flex-col gap-4 border-b px-5 pt-4 pb-4 backdrop-blur-sm">
        <SearchInput defaultSearch={search} />
      </div>

      {/* ── 2. CONTEÚDO DA PÁGINA (Título e Resultados Alinhados) ── */}
      <div className="flex flex-col gap-5 px-5 pt-5">
        {/* Título Padronizado */}
                <PageSectionTitle>Barbearias Populares</PageSectionTitle>


        {/* Lista de Barbearias */}
        {barbershops.length > 0 ? (
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        ) : (
          /* Estado Vazio Centralizado */
          <div className="flex flex-1 items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-zinc-400">
              Nenhuma barbearia ou serviço encontrado para essa pesquisa.
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
