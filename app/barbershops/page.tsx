import Header from "../_components/header";
import SearchInput from "../_components/search-input";
import BarbershopItem from "../_components/barbershop-item";
import { prisma } from "@/lib/prisma";
import { PageContainer, PageSectionTitle } from "../_components/ui/page";


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
  const search = resolvedSearchParams.search || "";

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <PageContainer>
          {/* Inicializa o input já preenchido com a busca atual */}
          <SearchInput defaultSearch={search} />


          <div className="mt-6">
            <PageSectionTitle>{`Resultados para "${search}"`}</PageSectionTitle>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {barbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>

            {barbershops.length === 0 && (
              <p className="text-muted-foreground mt-2 text-sm">
                Nenhuma barbearia ou serviço encontrado para essa pesquisa.
              </p>
            )}
          </div>
        </PageContainer>
      </div>

    </div>
  );
}
