"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const checkUserSubscription = async ({
  barbershopId,
}: {
  barbershopId: string;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return false;

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      plan: { barbershopId },
    },
  });

  return !!subscription;
};
