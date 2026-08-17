import { prisma as db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DollarSign, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect("/");

  const barbershop = await db.barbershop.findFirst({
    where: { userId: session.user.id },
  });

  if (!barbershop) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-wider uppercase">
          Bem-vindo!
        </h1>
        <p className="mt-2 text-zinc-400">
          Você ainda não configurou sua barbearia. Vá em Configurações para
          começar.
        </p>
      </div>
    );
  }

  // Cálculos do dia
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todaysBookings = await db.booking.findMany({
    where: {
      babershopId: barbershop.id,
      date: { gte: startOfDay, lte: endOfDay },
      cancelled: false,
    },
    include: { service: true },
  });

  const totalRevenueCents = todaysBookings.reduce(
    (acc, curr) => acc + curr.service.priceInCents,
    0,
  );

  const formattedRevenue = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalRevenueCents / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-wider text-white uppercase">
          Visão Geral
        </h1>
        <p className="text-sm font-medium text-zinc-400 capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card Faturamento */}
        <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <DollarSign size={20} />
            <span className="text-xs font-bold uppercase">Previsto Hoje</span>
          </div>
          <span className="text-3xl font-black text-white">
            {formattedRevenue}
          </span>
        </div>

        {/* Card Agendamentos */}
        <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-2 text-blue-400">
            <Users size={20} />
            <span className="text-xs font-bold uppercase">Clientes Hoje</span>
          </div>
          <span className="text-3xl font-black text-white">
            {todaysBookings.length}
          </span>
        </div>

        {/* Card Ticket Médio */}
        <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-2 text-purple-400">
            <TrendingUp size={20} />
            <span className="text-xs font-bold uppercase">Ticket Médio</span>
          </div>
          <span className="text-3xl font-black text-white">
            {todaysBookings.length > 0
              ? Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalRevenueCents / todaysBookings.length / 100)
              : "R$ 0,00"}
          </span>
        </div>
      </div>
    </div>
  );
}
