import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BarbershopDetails from "./_components/barbershop-details";

interface BarbershopDetailsPageProps {
  params: { id: string };
}

export default async function BarbershopDetailsPage(props: BarbershopDetailsPageProps) {
  const params  = await props.params;

  if (!params?.id) return notFound();

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: params.id },
    include: {
      services: true,
    },
  });

  if (!barbershop) return notFound();

  return <BarbershopDetails barbershop={barbershop} />;
}