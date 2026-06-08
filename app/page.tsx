import Header from "./_components/header";
import banner from "../public/banner_desconto.png";
import banner2 from "../public/banner_chat.png";
import banner3 from "../public/banner_melhor.png";
import { BannerCarousel } from "./_components/ui/banner-carousel";
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
import { QuickSearchButtons } from "./_components/ui/quick-search-buttons";
import { headers } from "next/headers";
import { ChatButton } from "./_components/chat-button";


const banners = [banner, banner2, banner3];

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
        <ChatButton />

        {/* BOTÕES DE BUSCA RÁPIDA */}
        <QuickSearchButtons />

        <div className="mt-6">
          <BannerCarousel banners={banners} />
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

    </main>
  );
};
export default Home;
