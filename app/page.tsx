import Header from "./_components/header";
import BookingItem from "./_components/booking-item";
import RepeatBookingCard from "./_components/repeat-booking-card";
import { prisma } from "@/lib/prisma";
import BarbershopItem from "./_components/barbershop-item";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

  // ── INCLUÍDO DE OPENINGHOURS PARA STATUS DINÂMICO ──
  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      openingHours: true,
    },
  });

  // 1. Agendamento futuro confirmado
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
          review: true,
        },
        orderBy: {
          date: "asc",
        },
      })
    : null;

  // 2. Último agendamento realizado (buscado apenas se NÃO houver confirmado)
  const lastBooking =
    session?.user && !confirmedBooking
      ? await prisma.booking.findFirst({
          where: {
            userId: session.user.id,
            date: {
              lt: new Date(),
            },
            cancelled: false,
          },
          include: {
            service: true,
            barbershop: true,
          },
          orderBy: {
            date: "desc",
          },
        })
      : null;

  return (
    <main className="bg-background min-h-screen w-full pb-24">
      {/* ── 1. HERO COM VÍDEO ── */}
      <section className="relative h-[220px] w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="via-background/60 to-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-b from-transparent" />

        <div className="relative z-20 flex h-full flex-col justify-between p-4">
          <Header />

          <div className="flex flex-col gap-0.5 pb-1">
            <h2 className="text-xl tracking-tight text-white">
              {session?.user ? (
                <>
                  <span className="font-normal">Olá, </span>
                  <span className="font-bold">{firstName}</span>
                </>
              ) : (
                <span className="font-bold">Olá!</span>
              )}
            </h2>
            <p className="text-xs font-medium text-gray-300 capitalize">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. CONTEÚDO PRINCIPAL ── */}
      <div className="flex flex-col gap-5 px-5 pt-3">
        {/* Próximo Agendamento */}
        {confirmedBooking && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase">
              Próximo Agendamento
            </h2>
            <BookingItem booking={confirmedBooking} />
          </div>
        )}

        {/* Último Agendamento */}
        {!confirmedBooking && lastBooking && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase">
              Último Agendamento
            </h2>
            <RepeatBookingCard booking={lastBooking} />
          </div>
        )}

        {/* Recomendados */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase">
            Recomendados
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {recommendedBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
