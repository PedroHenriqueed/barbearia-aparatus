"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { createCustomerPortal } from "@/app/_actions/create-customer-portal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Settings, CheckCircle2 } from "lucide-react";

interface SubscriptionCardProps {
  subscription: any;
}

export default function SubscriptionCard({
  subscription,
}: SubscriptionCardProps) {
  const router = useRouter();

  const { executeAsync, isPending } = useAction(createCustomerPortal, {
    onSuccess: ({ data }) => {
      if (data?.url) {
        router.push(data.url);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao abrir portal de assinatura.");
    },
  });

  const formattedRenewal = format(
    new Date(subscription.currentPeriodEnd),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );

  return (
    <Card className="rounded-xl border border-zinc-800 bg-black p-5 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-0">
        {/* TOPO: STATUS E BARBEARIA */}
        <div className="flex items-center justify-between">
          <Badge className="gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Assinatura Ativa
          </Badge>
          <span className="text-muted-foreground text-xs font-medium">
            {subscription.plan.barbershop.name}
          </span>
        </div>

        {/* INFORMAÇÕES DO PLANO E VALOR */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-foreground text-base font-bold">
              {subscription.plan.name}
            </h2>
            <p className="text-muted-foreground text-xs">
              Acesso ilimitado a serviços
            </p>
          </div>

          <div className="text-right">
            <span className="text-foreground text-xl font-bold">
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(subscription.plan.priceInCents / 100)}
            </span>
            <span className="text-muted-foreground text-xs font-normal">
              {" "}
              /mês
            </span>
          </div>
        </div>

        {/* DETALHES DE RENOVAÇÃO */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          <span className="text-muted-foreground text-sm">
            Próxima renovação
          </span>
          <span className="text-foreground text-sm font-medium capitalize">
            {formattedRenewal}
          </span>
        </div>

        {/* BOTÃO GERENCIAR */}
        <Button
          onClick={() => executeAsync()}
          disabled={isPending}
          variant="outline"
          className="mt-1 h-11 w-full gap-2 rounded-xl border-zinc-800 bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          <Settings className="h-4 w-4" />
          {isPending ? "Carregando..." : "Gerenciar no Stripe"}
        </Button>
      </CardContent>
    </Card>
  );
}
