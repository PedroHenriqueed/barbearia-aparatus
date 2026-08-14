import webpush from "web-push";
import { prisma } from "@/lib/prisma";

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
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  // 🛡️ Evita erro de build/execução se as chaves não estiverem no .env
  if (!publicKey || !privateKey) {
    console.warn(
      "⚠️ Chaves VAPID ausentes no .env. Notificação push ignorada.",
    );
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_MAILTO || "mailto:seu-email@dominio.com",
    publicKey,
    privateKey,
  );

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
