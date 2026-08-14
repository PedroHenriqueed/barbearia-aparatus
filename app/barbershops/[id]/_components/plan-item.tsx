"use client";

import { Plan } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Sparkles, Check } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { createSubscriptionCheckout } from "@/app/_actions/create-subscription-checkout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface PlanItemProps {
  plan: Plan;
}

export default function PlanItem({ plan }: PlanItemProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { executeAsync, isPending } = useAction(createSubscriptionCheckout, {
    onSuccess: ({ data }) => {
      if (data?.url) {
        router.push(data.url);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao iniciar assinatura.");
    },
  });

  const handleSubscribe = async () => {
    if (!session?.user) {
      toast.error("Você precisa fazer login para assinar um plano!");
      await authClient.signIn.social({ provider: "google" });
      return;
    }

    await executeAsync({ planId: plan.id });
  };

  return (
    <Card className="rounded-2xl border-zinc-500/30 bg-linear-to-b from-zinc-400/10 to-zinc-950 p-4 shadow-md">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex items-center justify-between">

        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
          {plan.description && (
            <p className="mt-1 text-xs text-zinc-400">{plan.description}</p>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(plan.priceInCents / 100)}
          </span>
          <span className="text-xs text-zinc-400">/mês</span>
        </div>

        <Button
          onClick={handleSubscribe}
          disabled={isPending}
          className="w-full rounded-xl bg-white font-bold text-zinc-950 hover:bg-[#ffffff]/70"
        >
          {isPending ? "Carregando..." : "Assinar Agora"}
        </Button>
      </CardContent>
    </Card>
  );
}
