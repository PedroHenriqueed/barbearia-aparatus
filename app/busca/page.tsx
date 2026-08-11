// app/barbershops/page.tsx
import SearchInput from "@/app/_components/search-input"
import BarbershopItem from "@/app/_components/barbershop-item"
import { prisma } from "@/lib/prisma"
import { SearchIcon } from "lucide-react"
import { Barbershop } from "@prisma/client"
import { ServiceCard } from "@/app/_components/ui/service-card"
import Link from "next/link"
import { PageSectionTitle } from "../_components/ui/page"

const services = [
  { title: "Cabelo",      image: "/cabelo.jpg",      href: "/barbershops?search=Cabelo"      },
  { title: "Barba",       image: "/barba.jpg",        href: "/barbershops?search=Barba"       },
  { title: "Acabamento",  image: "/pezinho.jpg",   href: "/barbershops?search=Acabamento"  },
  { title: "Sobrancelha", image: "/sobrancelha.jpg",  href: "/barbershops?search=Sobrancelha" },
  { title: "Massagem",    image: "/massagem.jpg",     href: "/barbershops?search=Massagem"    },
  { title: "Hidratação",  image: "/hidratacao.jpg",   href: "/barbershops?search=Hidratação"  },
]


export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const search = (await searchParams).search ?? ""

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
    : []

  const featuredBarbershops: Barbershop[] = !search
    ? await prisma.barbershop.findMany({ take: 6 })
    : []

  return (
    <div className=" flex flex-col pb-24 min-h-screen bg-background">
      {/* ── Cabeçalho sticky com busca ── */}
      <div className="relative  top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 pt-5 pb-4 shadow-sm">
        <SearchInput defaultSearch={search} />
      </div>

      {/* ══════════════════════════════════
          ESTADO VAZIO — sem busca ativa
      ══════════════════════════════════ */}
      {!search && (
        <div className="flex flex-col gap-8 px-5 pt-6">

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


          {/* ── Barbearias em destaque ── */}
          {featuredBarbershops.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
            <PageSectionTitle>Barbearias Populares</PageSectionTitle>
                {/* Badge "Ver todas" com a cor primary */}
                <Link
                  href="/barbershops"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {featuredBarbershops.map((barbershop) => (
                  <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ══════════════════════════════════
          ESTADO COM BUSCA — resultados
      ══════════════════════════════════ */}
      {search && (
        <div className="flex flex-col gap-5 px-5 pt-5">

          {/* ── Pill de contagem de resultados ── */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent w-fit">
            <SearchIcon size={14} className="text-primary" />
            <p className="text-xs text-accent-foreground">
              {barbershops.length > 0 ? (
                <>
                  <span className="font-bold text-primary">
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

          {/* ── Grid de resultados ── */}
          {barbershops.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {barbershops.map((b) => (
                <BarbershopItem key={b.id} barbershop={b} />
              ))}
            </div>
          ) : (
            /* ── Estado vazio — sem resultados ── */
            <div className="flex flex-col items-center justify-center gap-4 mt-16 text-center max-w-xs mx-auto">
              {/* Ícone centralizado com fundo accent */}
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-4xl shadow-inner">
                💈
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-base font-bold text-foreground">
                  Nenhuma barbearia encontrada
                </p>
                <p className="text-sm text-muted-foreground">
                  Tente buscar por outros serviços
                </p>
              </div>

              {/* Sugestões rápidas — pill com borda primary */}
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {["Cabelo", "Barba", "Sobrancelha", "Acabamento"].map((s) => (
                  <Link
                    key={s}
                    href={`/barbershops?search=${s}`}
                    className="
                      px-4 py-1.5 rounded-full text-xs font-semibold
                      border border-primary text-primary
                      hover:bg-primary hover:text-primary-foreground
                      transition-all duration-200
                    "
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
