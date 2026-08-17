import { prisma as db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ServicesClient from "@/app/admin/services/_components/services-client";

export default async function AdminServicesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect("/");

  const barbershop = await db.barbershop.findFirst({
    where: { userId: session.user.id },
    include: {
      services: true,
    },
  });

  if (!barbershop) return redirect("/admin/settings");

  return (
    <ServicesClient
      barbershopId={barbershop.id}
      initialServices={barbershop.services}
    />
  );
}
