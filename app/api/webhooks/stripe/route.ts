import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

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
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
        );

        const stripeChargeId = paymentIntent.latest_charge as string;

        await prisma.booking.create({
          data: {
            date: new Date(date),
            paymentId: stripeChargeId,
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
