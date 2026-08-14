import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubscriptionCard from "./_components/subscription-card";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

const SubscriptionsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/");
  }

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    include: {
      plan: {
        include: {
          barbershop: true,
        },
      },
    },
  });

  return (
    <main className="bg-background flex min-h-screen w-full flex-col pb-24">
      {/* Topo Padronizado (igual ao de Favoritos) */}
      <div className="bg-background/95 sticky top-0 z-20 px-5 pt-4 pb-2 backdrop-blur-sm"></div>

      {/* Conteúdo Principal */}
      <div className="flex flex-col gap-5 px-5 pt-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white">Assinatura</h1>
        </div>

        {activeSubscription ? (
          <SubscriptionCard subscription={activeSubscription} />
        ) : (
          <div className="border-border flex flex-col items-center justify-center gap-3 rounded-2xl border bg-zinc-900/50 p-6 text-center">
            <CreditCard className="h-10 w-10 text-zinc-500" />
            <h2 className="text-base font-semibold text-white">
              Nenhuma assinatura ativa
            </h2>
            <p className="text-xs text-zinc-400">
              Assine um plano em sua barbearia favorita para garantir cortes
              ilimitados e descontos exclusivos.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default SubscriptionsPage;
