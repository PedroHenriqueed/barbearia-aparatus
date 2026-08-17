"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ==========================================
// BARBEARIA
// ==========================================
export async function updateBarbershop(data: {
  id?: string;
  name: string;
  imageUrl: string;
  description: string;
  address: string;
  phones: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Você precisa estar logado para fazer isso.");
  }

  let barbershop;

  if (data.id && data.id !== "") {
    const existingBarbershop = await db.barbershop.findUnique({
      where: { id: data.id },
    });

    if (existingBarbershop?.userId !== session.user.id) {
      throw new Error("Esta barbearia não pertence a você.");
    }

    barbershop = await db.barbershop.update({
      where: { id: data.id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        description: data.description,
        address: data.address,
        phones: data.phones,
      },
    });
  } else {
    barbershop = await db.barbershop.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        description: data.description,
        address: data.address,
        phones: data.phones,
        userId: session.user.id,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath(`/barbershops/${barbershop.id}`);
  revalidatePath("/");
  return barbershop;
}

// ==========================================
// SERVIÇOS
// ==========================================
export async function createService(data: {
  barbershopId: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
}) {
  const service = await db.barbershopService.create({
    data: {
      babershopId: data.barbershopId,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imageUrl: data.imageUrl,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/services");
  revalidatePath(`/barbershops/${data.barbershopId}`);
  revalidatePath("/");
  return service;
}

export async function updateService(data: {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
}) {
  const service = await db.barbershopService.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imageUrl: data.imageUrl,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/services");
  revalidatePath(`/barbershops/${service.babershopId}`);
  revalidatePath("/");
  return service;
}

export async function deleteService(id: string) {
  const service = await db.barbershopService.delete({
    where: { id },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/services");
  revalidatePath(`/barbershops/${service.babershopId}`);
  revalidatePath("/");
}

// ==========================================
// HORÁRIOS
// ==========================================
export async function updateOpeningHours(
  barbershopId: string,
  hours: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    startTime: string;
    endTime: string;
    lunchStart?: string;
    lunchEnd?: string;
  }>,
) {
  await db.openingHour.deleteMany({
    where: { barbershopId },
  });

  await db.openingHour.createMany({
    data: hours.map((h) => ({
      barbershopId,
      dayOfWeek: h.dayOfWeek,
      isOpen: h.isOpen,
      startTime: h.startTime,
      endTime: h.endTime,
      lunchStart: h.lunchStart,
      lunchEnd: h.lunchEnd,
    })),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/hours");
  revalidatePath(`/barbershops/${barbershopId}`);
  revalidatePath("/");
}

// ==========================================
// AGENDA / AGENDAMENTOS
// ==========================================
export async function cancelBookingByBarber(bookingId: string) {
  const booking = await db.booking.update({
    where: { id: bookingId },
    data: {
      cancelled: true,
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/agenda");
  revalidatePath(`/barbershops/${booking.babershopId}`);
}
