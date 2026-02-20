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

  // Busca o último agendamento confirmado para exibir na home.
  // Filtra por usuário, data futura E que NÃO esteja cancelado.
  const confirmedBooking = session?.user
    ? await prisma.booking.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(),
          },
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

        <div className="mt-6">
          <Image
            src={banner}
            alt="Agende agora"
            sizes="100vw"
            className="h-auto w-full rounded-xl"
          />
        </div>

        {/* Se não houver booking confirmado (futuro e não cancelado), esta seção não renderiza */}
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
    </main>
  );
};
export default Home;
