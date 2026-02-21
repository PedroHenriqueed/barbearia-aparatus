import Header from "../_components/header";
import SearchInput from "../_components/search-input";
import BarbershopItem from "../_components/barbershop-item";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { PageContainer, PageSectionTitle } from "../_components/ui/page";
import Footer from "../_components/ui/footer";
import { Button } from "../_components/ui/button";
import Link from "next/link";
import {
  Scissors,
  Eye,
  Activity,
  SoapDispenserDroplet,
} from "lucide-react";

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

const quickSearchOptions = [
  { title: "Cabelo", icon: Scissors },
  { title: "Barba", imageUrl: "/mdi_mustache.svg" },
  { title: "Acabamento", imageUrl: "/razor.svg" },
  { title: "Sobrancelha", imageUrl: "/158079.svg" },
  { title: "Massagem", icon: Activity },
  { title: "Hidratação", icon: SoapDispenserDroplet },
];

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

          {/* Mantemos o carrossel de opções de busca rápida na página de resultados para facilitar */}
          <div className="mt-6 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {quickSearchOptions.map((option) => (
              <Button
                key={option.title}
                variant="foreground"
                className="border-border border-2 gap-2 rounded-full font-bold"
                asChild
              >
                <Link href={`/barbershops?search=${option.title}`}>
                  {/* Renderização Condicional: Se tiver imageUrl usa o <Image>, senão usa o Lucide */}
                  {option.imageUrl ? (
                    <Image
                      src={option.imageUrl}
                      width={16}
                      height={16}
                      alt={option.title}
                    />
                  ) : option.icon ? (
                    <option.icon size={16} />
                  ) : null}

                  {option.title}
                </Link>
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <PageSectionTitle>
              Resultados para &quot;{search}&quot;
            </PageSectionTitle>

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
      <Footer />
    </div>
  );
}
