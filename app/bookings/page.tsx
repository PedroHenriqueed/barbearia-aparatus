import Header from "../_components/header";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import BookingItem from "../_components/booking-item";
import { PageContainer, PageSectionTitle } from "../_components/ui/page";
import Footer from "../_components/ui/footer";

const BookingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Se o usuário não estiver logado, manda pro início
  if (!session?.user) {
    return redirect("/");
  }

  // 1. Calcula a data/hora limite (Agora menos 2 horas)
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 2);

  // 2. Busca APENAS agendamentos maiores que o horário limite
  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: cutoffTime,
      },
    },
    include: {
      service: true,
      barbershop: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <div className="flex min-h-screen flex-col">

      <div className="flex-1">
        <PageContainer>
          <h1 className="mb-6 text-xl font-bold">Agendamentos</h1>

          {bookings.length > 0 ? (
            <>
              {/* Ocultamos o título "Confirmados" ou "Finalizados" para ficar mais clean,
                  já que agora só vai ter uma lista na tela */}
              <div className="mt-3 flex flex-col gap-3">
                {bookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400">Você não possui agendamentos.</p>
          )}
        </PageContainer>
      </div>
      <Footer />
    </div>
  );
};

export default BookingsPage;
