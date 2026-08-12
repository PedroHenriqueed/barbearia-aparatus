import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-10-29.clover" as any,
  });

  const body = await request.text();
  // Obtém a assinatura diretamente dos headers da requisição
  const signature = request.headers.get("stripe-signature") as string;

  if (!signature) {
    return NextResponse.json(
      { error: "Assinatura do Stripe ausente" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error: any) {
    console.error(`❌ Erro de assinatura no Webhook: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const serviceId = session.metadata?.serviceId;
    const barbershopId = session.metadata?.barbershopId;
    const userId = session.metadata?.userId;
    const date = session.metadata?.date;

    if (serviceId && barbershopId && userId && date) {
      try {
        // 🔒 CHECAGEM 1: Já existe booking para essa sessão do Stripe?
        const existingBySession = await prisma.booking.findFirst({
          where: { stripeSessionId: session.id },
        });

        if (existingBySession) {
          console.log(
            "⚠️ Evento duplicado ignorado (session.id já processado).",
          );
          return NextResponse.json({ received: true });
        }

        // Identificador do pagamento (utiliza o PaymentIntent ID ou o próprio Session ID como fallback)
        const paymentId = (session.payment_intent as string) || session.id;

        // 🔒 CHECAGEM 2: Já existe booking com esse paymentId? (CORRIGIDO: usa a coluna paymentId)
        const existingByPayment = await prisma.booking.findFirst({
          where: { paymentId: paymentId },
        });

        if (existingByPayment) {
          console.log(
            "⚠️ Evento duplicado ignorado (paymentId já processado).",
          );
          return NextResponse.json({ received: true });
        }

        // Criação da reserva
        await prisma.booking.create({
          data: {
            date: new Date(date),
            paymentId: paymentId,
            stripeSessionId: session.id,
            paymentMethod: PaymentMethod.ONLINE,
            paymentStatus: PaymentStatus.PAID,
            user: {
              connect: { id: userId },
            },
            service: {
              connect: { id: serviceId },
            },
            barbershop: {
              connect: { id: barbershopId },
            },
          },
        });

        console.log("✅ Reserva criada com sucesso! Session ID:", session.id);
      } catch (dbError: any) {
        console.error("❌ ERRO AO SALVAR RESERVA NO BANCO (Webhook):", dbError);
        return NextResponse.json(
          { error: "Erro no banco de dados" },
          { status: 500 },
        );
      }
    } else {
      console.error("❌ Faltam dados no metadata do Stripe:", {
        serviceId,
        barbershopId,
        userId,
        date,
      });
    }
  }

  return NextResponse.json({ received: true });
}
