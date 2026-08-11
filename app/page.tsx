import Header from "./_components/header";
import BookingItem from "./_components/booking-item";
import { prisma } from "@/lib/prisma";
import SearchInput from "@/app/_components/search-input";
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


// Tipagem para receber parâmetros da URL (Next.js 15+ App Router)
interface HomeProps {
  searchParams: Promise<{ search?: string }>;
}

const Home = async (props: HomeProps) => {
  // Pega a sessão usando a sua autenticação atual
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Extrai apenas o primeiro nome do usuário (se estiver logado)
  const firstName = session?.user?.name?.split(" ")[0];

  // Captura o parâmetro de busca (search) da URL, se existir
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
    <main className="flex flex-col pb-24 min-h-screen bg-background">
      <Header />

      {/* --- SEÇÃO DE SAUDAÇÃO --- */}
      <div className="px-5 pt-5">
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
        <p className="text-sm font-medium text-gray-300 mt-1 capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* ── CABEÇALHO STICKY COM BUSCA ── */}
      <div className=" px-5 pt-5 pb-4 ">
        <SearchInput defaultSearch={search} />
      </div>

      {/* Restante do conteúdo da página */}
      <PageContainer>
        <ChatButton />

        {confirmedBooking && (
          <PageSection>
            <PageSectionTitle>Agendamentos</PageSectionTitle>
            <BookingItem booking={confirmedBooking} />
          </PageSection>
        )}
        <PageSection>
          <PageSectionTitle>Favoritos</PageSectionTitle>
          <PageScrollContainer>
            {favoriteBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageScrollContainer>
        </PageSection>

        <PageSection>
          <PageSectionTitle>Recomendados</PageSectionTitle>
          <PageScrollContainer>
            {recommendedBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageScrollContainer>
        </PageSection>

        <PageSection>
          <PageSectionTitle>Populares</PageSectionTitle>
          <PageScrollContainer>
            {popularBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageScrollContainer>
        </PageSection>


      </PageContainer>
    </main>
  );
};

export default Home;