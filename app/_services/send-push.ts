import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  "mailto:seu-email@dominio.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendRealPushNotification({
  userId,
  title,
  message,
  url = "/",
}: {
  userId: string;
  title: string;
  message: string;
  url?: string;
}) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const payload = JSON.stringify({ title, message, url });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys as any,
        },
        payload,
      );
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Remove assinaturas expiradas/inválidas do banco
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}
