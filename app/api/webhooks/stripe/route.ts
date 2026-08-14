import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const serviceId = session.metadata?.serviceId;
    const barbershopId = session.metadata?.barbershopId;
    const userId = session.metadata?.userId;
    const date = session.metadata?.date;

    if (serviceId && barbershopId && userId && date) {
      try {
        // 🔒 CHECAGEM 1: Já existe booking com essa sessão do Stripe?
        const existingBySession = await prisma.booking.findFirst({
          where: { stripeSessionId: session.id },
        });

        if (existingBySession) {
          console.log(
            "⚠️ Evento duplicado ignorado (session.id já processado).",
          );
          return NextResponse.json({ received: true });
        }

        const paymentId = (session.payment_intent as string) || session.id;

        // 🔒 CHECAGEM 2: Já existe booking com esse paymentId?
        const existingByPayment = await prisma.booking.findFirst({
          where: { paymentId: paymentId },
        });

        if (existingByPayment) {
          console.log(
            "⚠️ Evento duplicado ignorado (paymentId já processado).",
          );
          return NextResponse.json({ received: true });
        }

        // 1. Criação da reserva no banco de dados (incluindo dados do serviço e barbearia para o texto da notificação)
        const newBooking = await prisma.booking.create({
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
          include: {
            service: true,
            barbershop: true,
          },
        });

        console.log("✅ Reserva criada com sucesso! Session ID:", session.id);

        const notificationTitle = "Pagamento e Agendamento Confirmados! 💳";
        const notificationMessage = `Sua reserva para ${newBooking.service.name} na ${newBooking.barbershop.name} foi confirmada.`;

        // 2. Salva a notificação no banco de dados (para a gaveta de notificações do app)
        await prisma.notification.create({
          data: {
            userId,
            title: notificationTitle,
            message: notificationMessage,
            type: "PROMOTION",
          },
        });

        // 3. Envia o Push real no dispositivo/computador do usuário
        await sendRealPushNotification({
          userId,
          title: notificationTitle,
          message: notificationMessage,
          url: "/bookings",
        });
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
