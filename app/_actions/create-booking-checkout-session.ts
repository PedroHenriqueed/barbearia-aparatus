"use server";

import { actionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.date(),
});

export const createBookingCheckoutSession = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date } }) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Unauthorized"],
      });
    }

    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        barbershop: true,
      },
    });

    if (!service) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Service not found"],
      });
    }

    // Valida se o horário já não foi reservado por outro cliente
    const existingBooking = await prisma.booking.findFirst({
      where: {
        babershopId: service.babershopId,
        date: date,
      },
    });

    if (existingBooking) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Booking already exists"],
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      metadata: {
        date: date.toISOString(),
        serviceId: service.id,
        barbershopId: service.babershopId,
        userId: session.user.id,
        paymentMethod: "ONLINE",
      },
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: service.priceInCents,
            product_data: {
              name: `${service.barbershop.name} - ${service.name}`,
              description: service.description,
              images: [service.imageUrl],
            },
          },
          quantity: 1,
        },
      ],
    });

    return checkoutSession;
  });