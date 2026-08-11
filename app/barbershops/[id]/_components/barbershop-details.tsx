// app/_components/barbershop-details.tsx
"use client";

import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { ArrowLeft, Heart, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ServiceItem from "./service-item";
import { Barbershop, BarbershopService } from "@prisma/client";

interface BarbershopDetailsProps {
  barbershop: Barbershop & {
    services: BarbershopService[];
  };
  initialFavorite: boolean; // 👈 novo
}

export default function BarbershopDetails({
  barbershop,
  initialFavorite, // 👈 novo
}: BarbershopDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleFavorite() {
    if (isLoading) return;

    setIsLoading(true);
    const newState = !isFavorite;

    try {
      setIsFavorite(newState);
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId: barbershop.id,
          isFavorite: newState,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
    } catch {
      setIsFavorite(!newState); // rollback
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard(phone: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(phone);
    }
  }

  return (
    <div className="bg-background min-h-screen w-full overflow-hidden">
      <div className="relative h-[290px] w-full">
        <Link href="/" className="absolute top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>

        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-md px-6 py-5 rounded-t-3xl flex flex-col gap-1">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl font-bold tracking-tight">
                {barbershop.name}
              </h1>
              <p className="text-gray-400 flex items-center gap-1 text-sm">
                {barbershop.address}
              </p>
            </div>

            {/* 👇 BOTÃO FAVORITO FUNCIONAL */}
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading}
              onClick={toggleFavorite}
              className={`text-white hover:bg-white/10 rounded-full transition-all ${
                isLoading ? "opacity-50" : ""
              }`}
              aria-label={
                isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
              }
            >
              <Heart
                className="h-6 w-6"
                fill={isFavorite ? "white" : "none"}
                stroke="white"
                strokeWidth={2}
              />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-white">
              <StarIcon size={14} className="text-white" />
              <span className="font-semibold text-white">4.8</span>
              <span className="text-gray-300 text-xs">( 114 avaliações )</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
          SERVIÇOS
        </h2>
        <div className="flex flex-col gap-3 text-sm">
          {barbershop.services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              barbershop={barbershop}
            />
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      <div className="pb-10">
        <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
          CONTATO
        </h2>
        <div className="flex flex-col gap-2">
          {barbershop.phones.map((phone, index) => (
            <div
              key={`${phone}-${index}`}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-smartphone text-foreground"></i>
                <span className="text-foreground text-sm">{phone}</span>
              </div>
              <Button
                size="sm"
                className="rounded-full px-4 text-xs font-bold"
                onClick={() => copyToClipboard(phone)}
              >
                Copiar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
