import Header from "./_components/header";
import BookingItem from "./_components/booking-item";
import { prisma } from "@/lib/prisma";
import BarbershopItem from "./_components/barbershop-item";
import {
  PageContainer,
  PageSectionTitle,
  PageSection,
  PageScrollContainer,
} from "./_components/ui/page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChatButton } from "./_components/chat-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HomeProps {
  searchParams: Promise<{ search?: string }>;
}

const Home = async (props: HomeProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const firstName = session?.user?.name?.split(" ")[0];

  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";

  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const favoriteBarbershops = session?.user
    ? await prisma.barbershop.findMany({
        where: {
          favorites: { some: { userId: session.user.id } },
        },
      })
    : [];

  const popularBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
  });

  const confirmedBooking = session?.user
    ? await prisma.booking.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(),
          },
          cancelled: false,
        },
        include: {
          service: true,
          barbershop: true,
        },
        orderBy: {
          date: "asc",
        },
      })
    : null;

  return (
    <main className="bg-background flex min-h-screen flex-col pb-24">
      {/* ── SEÇÃO HERO COM VÍDEO E DEGRADÊ INFERIOR ── */}
      <section className="relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden pb-6">
        {/* Vídeo em Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay Escuro Geral */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

        {/* DEGRADÊ PARA A PÁGINA (Fade suave na borda inferior do vídeo) */}
        <div className="via-background/60 to-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-b from-transparent" />

        {/* Header transparente sobre o vídeo */}
        <div className="relative z-20">
          <Header />
        </div>

        {/* Conteúdo da Saudação e do Campo de Busca */}
        <div className="relative z-20 flex flex-1 flex-col justify-end px-5 pt-8">
          <div className="mt- flex flex-col gap-1">
            <h2 className="text-3xl tracking-tight text-white">
              {session?.user ? (
                <>
                  <span className="font-normal">Olá, </span>
                  <span className="font-bold">{firstName}</span>
                </>
              ) : (
                <span className="font-bold">Olá!</span>
              )}
            </h2>
            <p className="text-sm font-medium text-gray-300 capitalize">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
      </section>

      {/* Restante do conteúdo */}
      <PageContainer>
        <ChatButton />

        {confirmedBooking && (
          <PageSection>
            <PageSectionTitle>Agendamentos</PageSectionTitle>
            <BookingItem booking={confirmedBooking} />
          </PageSection>
        )}

        {favoriteBarbershops.length > 0 && (
          <PageSection>
            <PageSectionTitle>Favoritos</PageSectionTitle>
            <PageScrollContainer>
              {favoriteBarbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </PageScrollContainer>
          </PageSection>
        )}

        <PageSection>
          <PageSectionTitle>Recomendados</PageSectionTitle>
          <PageScrollContainer>
            {recommendedBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageScrollContainer>
        </PageSection>

      </PageContainer>
    </main>
  );
};

export default Home;
