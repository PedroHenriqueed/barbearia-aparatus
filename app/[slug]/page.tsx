import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SlugRedirectPage({ params }: PageProps) {
  const { slug } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!barbershop) {
    notFound();
  }

  // Redireciona direto para a página oficial mantendo renderização rápida
  redirect(`/barbershops/${barbershop.id}`);
}
