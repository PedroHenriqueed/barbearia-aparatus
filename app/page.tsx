import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import Image from "next/image";
import banner from "../public/banner.png";
import BookingItem from "./_components/booking-item";
import { prisma } from "@/lib/prisma";
import BarbershopItem from "./_components/barbershop-item";
import Footer from "./_components/ui/footer";
import {
  PageContainer,
  PageSectionTitle,
  PageSection,
  PageScrollContainer,
} from "./_components/ui/page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "./_components/ui/button";
import Link from "next/link";
import { ChatButton } from "./_components/chat-button";
import { Scissors, Eye, Activity, SoapDispenserDroplet } from "lucide-react"; // Importação dos ícones

// Array com os atalhos usando componentes do Lucide
const quickSearchOptions = [
  { title: "Cabelo", icon: Scissors },
  { title: "Barba", imageUrl: "/mdi_mustache.svg" },
  { title: "Acabamento", imageUrl: "/razor.svg" },
  { title: "Sobrancelha", imageUrl: "/158079.svg" },
  { title: "Massagem", icon: Activity },
  { title: "Hidratação", icon: SoapDispenserDroplet },
];

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
  });
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
    <main>
      <Header />
      <PageContainer>
        <SearchInput />

        {/* BOTÕES DE BUSCA RÁPIDA */}
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
          <Image
            src={banner}
            alt="Agende agora"
            sizes="100vw"
            className="h-auto w-full rounded-xl"
          />
        </div>

        {confirmedBooking && (
          <PageSection>
            <PageSectionTitle>Agendamentos</PageSectionTitle>
            <BookingItem booking={confirmedBooking} />
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

        <PageSection>
          <PageSectionTitle>Populares</PageSectionTitle>
          <PageScrollContainer>
            {popularBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageScrollContainer>
        </PageSection>
      </PageContainer>
      <Footer />
      {/* O botão flutuante do chat no cantinho */}
      <ChatButton />
    </main>
  );
};
export default Home;
