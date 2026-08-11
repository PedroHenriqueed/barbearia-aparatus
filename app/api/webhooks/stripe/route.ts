import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client"; // 1. Importação dos Enums

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-10-29.clover",
  });

  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error: any) {
    console.error(`Erro de assinatura no Webhook: ${error.message}`);
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
        // 🔒 CHECAGEM 1: já existe booking para essa sessão do Stripe?
        const existingBySession = await prisma.booking.findFirst({
          where: { stripeSessionId: session.id },
        });

        if (existingBySession) {
          console.log("⚠️ Evento duplicado ignorado (session.id já processado).");
          return NextResponse.json({ received: true });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
        );

        const stripeChargeId = paymentIntent.latest_charge as string;

        // 🔒 CHECAGEM 2: já existe booking com esse paymentId?
        const existingByPayment = await prisma.booking.findFirst({
          where: { stripeSessionId: stripeChargeId },
        });

        if (existingByPayment) {
          console.log("⚠️ Evento duplicado ignorado (paymentId já processado).");
          return NextResponse.json({ received: true });
        }

        // 2. Criação do agendamento com as flags de pagamento corretas
        await prisma.booking.create({
          data: {
            date: new Date(date),
            paymentId: stripeChargeId,
            stripeSessionId: session.id,
            paymentMethod: PaymentMethod.ONLINE, // Fix: Marca como pagamento ONLINE
            paymentStatus: PaymentStatus.PAID,   // Fix: Marca como PAGO
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

        console.log("✅ Reserva criada com sucesso! Charge ID:", stripeChargeId);
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