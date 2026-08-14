import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus,
} from "@prisma/client";
import { sendRealPushNotification } from "@/app/_services/send-push";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

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

  try {
    // 1. PROCESSA AGENDAMENTOS AVULSOS
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const serviceId = session.metadata?.serviceId;
      const barbershopId = session.metadata?.barbershopId;
      const userId = session.metadata?.userId;
      const date = session.metadata?.date;

      if (serviceId && barbershopId && userId && date) {
        const existingBySession = await prisma.booking.findFirst({
          where: { stripeSessionId: session.id },
        });

        if (existingBySession) {
          return NextResponse.json({ received: true });
        }

        const paymentId = (session.payment_intent as string) || session.id;

        const newBooking = await prisma.booking.create({
          data: {
            date: new Date(date),
            paymentId: paymentId,
            stripeSessionId: session.id,
            paymentMethod: PaymentMethod.ONLINE,
            paymentStatus: PaymentStatus.PAID,
            user: { connect: { id: userId } },
            service: { connect: { id: serviceId } },
            barbershop: { connect: { id: barbershopId } },
          },
          include: {
            service: true,
            barbershop: true,
          },
        });

        const notificationTitle = "Pagamento e Agendamento Confirmados! 💳";
        const notificationMessage = `Sua reserva para ${newBooking.service.name} na ${newBooking.barbershop.name} foi confirmada.`;

        await prisma.notification.create({
          data: {
            userId,
            title: notificationTitle,
            message: notificationMessage,
            type: "PROMOTION",
          },
        });

        await sendRealPushNotification({
          userId,
          title: notificationTitle,
          message: notificationMessage,
          url: "/bookings",
        });
      }
    }

    // 2. PROCESSA CRIAÇÃO E RENOVAÇÃO DE ASSINATURAS
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;
      const stripePriceId = subscription.items.data[0]?.price?.id;

      if (stripePriceId) {
        const plan = await prisma.plan.findUnique({
          where: { stripePriceId },
        });

        if (plan) {
          const userId = subscription.metadata?.userId;

          if (userId) {
            let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
            if (subscription.status === "canceled")
              status = SubscriptionStatus.CANCELED;
            if (subscription.status === "past_due")
              status = SubscriptionStatus.PAST_DUE;
            if (subscription.status === "incomplete")
              status = SubscriptionStatus.INCOMPLETE;

            // Garante uma data válida para a renovação
            const periodEndTimestamp = (subscription as any).current_period_end;
            const periodEndDate = periodEndTimestamp
              ? new Date(periodEndTimestamp * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await prisma.subscription.upsert({
              where: { stripeSubscriptionId: subscription.id },
              update: {
                status,
                currentPeriodEnd: periodEndDate,
              },
              create: {
                userId,
                planId: plan.id,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId,
                status,
                currentPeriodEnd: periodEndDate,
              },
            });

            console.log("✅ Assinatura gravada no banco de dados com sucesso!");
          } else {
            console.error("⚠️ userId ausente no metadata da assinatura.");
          }
        }
      }
    }

    // 3. PROCESSA CANCELAMENTO DE ASSINATURAS
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: SubscriptionStatus.CANCELED },
      });
    }
  } catch (error: any) {
    console.error("❌ ERRO INTERNO NO WEBHOOK:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
