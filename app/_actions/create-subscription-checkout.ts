"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const inputSchema = z.object({
  planId: z.string(),
});

export const createSubscriptionCheckout = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { planId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado.");
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error("Plano não encontrado.");
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: plan.id,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/barbershops/${plan.barbershopId}`,
    });

    return { url: checkoutSession.url };
  });
