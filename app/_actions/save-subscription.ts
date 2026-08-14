"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function savePushSubscription(subscription: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false };

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId: session.user.id,
      keys: subscription.keys,
    },
    create: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
  });

  return { success: true };
}
