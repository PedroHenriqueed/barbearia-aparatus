import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import BookingItem from "../_components/booking-item";
import { PageContainer } from "../_components/ui/page";
import { CalendarX2 } from 'lucide-react';
import { Button } from "../_components/ui/button";


const BookingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/");
  }

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 2);

  // Busca Confirmados
  const confirmedBookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      date: { gte: cutoffTime },
    },
    include: { service: true, barbershop: true },
    orderBy: { date: "asc" },
  });

  // Busca Histórico (Finalizados)
  const finishedBookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      date: { lt: cutoffTime },
    },
    include: { service: true, barbershop: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageContainer>
        <h1 className="mt-5 mb-6 text-xl font-bold">Agendamentos</h1>

        {/* SEÇÃO 1: CONFIRMADOS / ATIVOS */}
        {confirmedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-400 uppercase text-xs font-bold mb-3">
              Confirmados
            </h2>
            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* SEÇÃO 2: HISTÓRICO / FINALIZADOS */}
        {finishedBookings.length > 0 && (
          <div>
            <h2 className="text-gray-400 uppercase text-xs font-bold mb-3">
              Finalizados
            </h2>
            <div className="flex flex-col gap-4">
              {finishedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-2"
                >
                  {/* Card do agendamento antigo */}
                  <BookingItem booking={booking} />

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ESTADO VAZIO (Caso não tenha nada nem em confirmados nem em histórico) */}
        {confirmedBookings.length === 0 && finishedBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-3">
            <CalendarX2 size={72} className="text-gray-400"/>
            <p className="text-gray-400 text-sm font-medium mb-4">
              Você não possui agendamentos!
            </p>
            <Button asChild className="bg-blue-600 text-white rounded-full">
              <Link href="/busca">Buscar Barbearias</Link>
            </Button>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default BookingsPage;