// app/barbershops/page.tsx
import SearchInput from "@/app/_components/search-input";
import BarbershopItem from "@/app/_components/barbershop-item";
import { prisma } from "@/lib/prisma";
import { SearchIcon } from "lucide-react";
import { Barbershop } from "@prisma/client";
import { ServiceCard } from "@/app/_components/ui/service-card";
import Link from "next/link";
import { PageSectionTitle } from "../_components/ui/page";

const services = [
  { title: "Cabelo", image: "/cabelo.jpg", href: "/barbershops?search=Cabelo" },
  { title: "Barba", image: "/barba.jpg", href: "/barbershops?search=Barba" },
  {
    title: "Acabamento",
    image: "/pezinho.jpg",
    href: "/barbershops?search=Acabamento",
  },
  {
    title: "Sobrancelha",
    image: "/sobrancelha.jpg",
    href: "/barbershops?search=Sobrancelha",
  },
  {
    title: "Massagem",
    image: "/massagem.jpg",
    href: "/barbershops?search=Massagem",
  },
  {
    title: "Hidratação",
    image: "/hidratacao.jpg",
    href: "/barbershops?search=Hidratação",
  },
];

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const search = (await searchParams).search ?? "";

  const barbershops: Barbershop[] = search
    ? await prisma.barbershop.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            {
              services: {
                some: { name: { contains: search, mode: "insensitive" } },
              },
            },
          ],
        },
      })
    : [];

  const featuredBarbershops: Barbershop[] = !search
    ? await prisma.barbershop.findMany({ take: 6 })
    : [];

  return (
    <main className="bg-background flex min-h-screen w-full flex-col pb-24">
      {/* ── Cabeçalho Sticky (Header + Barra de Busca) ── */}
      <div className="border-border bg-background/95 sticky top-0 z-20 flex flex-col gap-4 border-b px-5 pt-4 pb-4 backdrop-blur-sm">
        <SearchInput defaultSearch={search} />
      </div>

      {/* ══════════════════════════════════
          ESTADO VAZIO — Sem busca ativa
         ══════════════════════════════════ */}
      {!search && (
        <div className="flex flex-col gap-6 px-5 pt-5">
          {/* Seção Buscar por serviço */}
          <section className="flex flex-col gap-3">
            <PageSectionTitle>Buscar por serviço</PageSectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.title}
                  title={service.title}
                  image={service.image}
                  href={service.href}
                />
              ))}
            </div>
          </section>

          {/* Seção Barbearias Populares */}
          {featuredBarbershops.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <PageSectionTitle>Barbearias Populares</PageSectionTitle>
                <Link
                  href="/barbershops"
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  Ver todas
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {featuredBarbershops.map((barbershop) => (
                  <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ══════════════════════════════════
          ESTADO COM BUSCA — Resultados
         ══════════════════════════════════ */}
      {search && (
        <div className="flex flex-col gap-5 px-5 pt-5">
          {/* Tag com contagem de resultados */}
          <div className="bg-accent flex w-fit items-center gap-2 rounded-lg px-3 py-2">
            <SearchIcon size={14} className="text-primary" />
            <p className="text-accent-foreground text-xs">
              {barbershops.length > 0 ? (
                <>
                  <span className="text-primary font-bold">
                    {barbershops.length}
                  </span>{" "}
                  resultado{barbershops.length > 1 ? "s" : ""} para{" "}
                  <span className="font-bold">&quot;{search}&quot;</span>
                </>
              ) : (
                <>
                  Nenhum resultado para{" "}
                  <span className="font-bold">&quot;{search}&quot;</span>
                </>
              )}
            </p>
          </div>

          {/* Lista de resultados em cards verticais */}
          {barbershops.length > 0 ? (
            <div className="flex flex-col gap-3">
              {barbershops.map((b) => (
                <BarbershopItem key={b.id} barbershop={b} />
              ))}
            </div>
          ) : (
            /* Estado sem resultados com sugestões */
            <div className="mx-auto mt-12 flex max-w-xs flex-col items-center justify-center text-center">
              <div className="bg-accent mb-3 flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-inner">
                💈
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-foreground text-base font-bold">
                  Nenhuma barbearia encontrada
                </p>
                <p className="text-muted-foreground text-xs">
                  Tente buscar por outros serviços
                </p>
              </div>

              {/* Sugestões rápidas de busca */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Cabelo", "Barba", "Sobrancelha", "Acabamento"].map((s) => (
                  <Link
                    key={s}
                    href={`/barbershops?search=${s}`}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full border px-3.5 py-1 text-xs font-semibold transition-all duration-200"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
