import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Header from "@/app/_components/header";
import BookingItem from "@/app/_components/booking-item";
import UnauthenticatedMessage from "@/app/_components/unauthenticated-message";

export const dynamic = "force-dynamic";

const BookingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <UnauthenticatedMessage />
      </div>
    );
  }

  // Busca todos os agendamentos do usuário logado
  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      service: true,
      barbershop: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const now = new Date();

  // 1. Confirmados: Não cancelados e com data futura/atual
  const confirmedBookings = bookings.filter(
    (booking) => !booking.cancelled && new Date(booking.date) >= now,
  );

  // 2. Finalizados: Não cancelados e com data passada
  const finishedBookings = bookings.filter(
    (booking) => !booking.cancelled && new Date(booking.date) < now,
  );

  // 3. Cancelados: Propriedade cancelled verdadeira
  const cancelledBookings = bookings.filter(
    (booking) => booking.cancelled === true,
  );

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header />

      <div className="flex flex-col gap-6 p-5">

        {/* 1. Agendamentos Confirmados (Futuros) */}
        {confirmedBookings.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase">
              Confirmados
            </h2>
            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* 2. Agendamentos Finalizados (Passados) */}
        {finishedBookings.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase">
              Finalizados
            </h2>
            <div className="flex flex-col gap-3">
              {finishedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* 3. Agendamentos Cancelados */}
        {cancelledBookings.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase">
              Cancelados
            </h2>
            <div className="flex flex-col gap-3">
              {cancelledBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Caso o usuário não tenha nenhum agendamento */}
        {confirmedBookings.length === 0 &&
          finishedBookings.length === 0 &&
          cancelledBookings.length === 0 && (
            <p className="text-sm text-gray-400">
              Você ainda não possui agendamentos.
            </p>
          )}
      </div>
    </div>
  );
};

export default BookingsPage;
