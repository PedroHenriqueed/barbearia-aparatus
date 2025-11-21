import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BarbershopDetails from "./_components/barbershop-details";

interface BarbershopDetailsPageProps {
  params: { id: string };
}

export default async function BarbershopDetailsPage({
  params,
}: BarbershopDetailsPageProps) {
  // Em Next.js 15+, params deve ser aguardado se for uma Promise, mas na versão atual estável (14) geralmente é objeto direto.
  // Se estiver usando Next 15 RC, params é uma Promise.
  // Assumindo Next 14+ padrão pelo contexto, mas o código original tinha um await props.params que parecia desnecessário ou para versão futura.
  // Vou manter o acesso direto, mas se der erro de 'params' ser Promise, adicione 'await'.
  // O código original tinha: const params = await props.params; -> Isso sugere Next.js 15.

  // Correção para garantir compatibilidade se for Promise (padrão novo) ou objeto:
  const { id } = await params;

  if (!id) return notFound();

  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    include: {
      services: true,
    },
  });

  if (!barbershop) return notFound();

  return <BarbershopDetails barbershop={barbershop} />;
}
