import Header from "../_components/header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingItem from "../_components/booking-item";
import Footer from "../_components/ui/footer";


export default async function BookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/");
  }

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

  // CONFIRMADOS: Apenas datas futuras E que NÃO estão cancelados
  const confirmedBookings = bookings.filter(
    (booking) => booking.date > new Date() && !booking.cancelled,
  );

  // FINALIZADOS: Datas passadas OU cancelados
  const finishedBookings = bookings.filter(
    (booking) => booking.date <= new Date() || booking.cancelled,
  );

  return (
    <>
      <Header />

      <div className="space-y-6 p-5 pb-24">
        <h1 className="text-foreground text-xl font-bold">Agendamentos</h1>

        {/* Seção de Confirmados */}
        {confirmedBookings.length > 0 && (
          <div>
            <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
              CONFIRMADOS
            </h2>
            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Seção de Finalizados */}
        {finishedBookings.length > 0 && (
          <div>
            <h2 className="text-muted-foreground mt-6 mb-3 text-xs font-bold uppercase">
              FINALIZADOS
            </h2>
            <div className="flex flex-col gap-3">
              {finishedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {confirmedBookings.length === 0 && finishedBookings.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Você não possui agendamentos.
          </p>
        )}
      </div>

      <Footer />
    </>
  );
}
