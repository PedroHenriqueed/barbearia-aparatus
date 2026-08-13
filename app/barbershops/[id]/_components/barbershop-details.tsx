"use client";

import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { ArrowLeft, Heart, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ServiceItem from "./service-item";
import { Barbershop, BarbershopService, Review, User } from "@prisma/client";
import ReviewDialog from "@/app/_components/review";

type ReviewWithUser = Review & {
  user: User;
};

interface BarbershopDetailsProps {
  barbershop: Barbershop & {
    services: BarbershopService[];
    reviews?: ReviewWithUser[];
  };
  initialFavorite: boolean;
  averageScore: number;
  totalReviews: number;
}

export default function BarbershopDetails({
  barbershop,
  initialFavorite,
  averageScore,
  totalReviews,
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
    <div className="bg-background min-h-screen w-full max-w-full overflow-x-hidden pb-20">
      {/* BANNER / HEADER */}
      <div className="relative h-[290px] w-full">
        <Link href="/" className="absolute top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/10"
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

        <div className="absolute right-0 bottom-0 left-0 z-20 flex flex-col gap-2 rounded-t-3xl bg-black/40 px-6 py-5 backdrop-blur-md">
          <div className="flex w-full items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white">
                {barbershop.name}
              </h1>
              <p className="flex items-center gap-1 truncate text-sm text-gray-400">
                {barbershop.address}
              </p>
            </div>

            {/* BOTÃO FAVORITO FUNCIONAL */}
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading}
              onClick={toggleFavorite}
              className={`shrink-0 rounded-full text-white transition-all hover:bg-white/10 ${
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

          {/* NOTAS DINÂMICAS E BOTÃO DE AVALIAR */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-white">
              <StarIcon size={12} className="fill-white text-white" />
              <span className="text-xs font-bold text-white">
                {averageScore > 0 ? averageScore : "Novo"}
              </span>
              <span className="text-xs text-gray-300">
                ({totalReviews}{" "}
                {totalReviews === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>

            {/* BOTÃO MODAL DE AVALIAÇÃO */}
            <ReviewDialog barbershopId={barbershop.id} />
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* SEÇÃO DE SERVIÇOS */}
      <div className="px-5">
        <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
          SERVIÇOS
        </h2>
        <div className="flex w-full max-w-full min-w-0 flex-col gap-3 text-sm">
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

      {/* SEÇÃO DE CONTATO */}
      <div className="px-5">
        <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
          CONTATO
        </h2>
        <div className="flex flex-col gap-2">
          {barbershop.phones.map((phone, index) => (
            <div
              key={`${phone}-${index}`}
              className="flex w-full min-w-0 items-center justify-between gap-2"
            >
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <i className="fi fi-rr-smartphone text-foreground shrink-0"></i>
                <span className="text-foreground truncate text-sm">
                  {phone}
                </span>
              </div>
              <Button
                size="sm"
                className="shrink-0 rounded-full bg-white px-4 text-xs font-bold text-black hover:bg-[#ffffff]/70"
                onClick={() => copyToClipboard(phone)}
              >
                Copiar
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* SEÇÃO DE AVALIAÇÕES E COMENTÁRIOS */}
      <div className="px-5 pb-10">
        <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
          AVALIAÇÕES ({totalReviews})
        </h2>

        {barbershop.reviews && barbershop.reviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {barbershop.reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.user.image ?? ""} />
                      <AvatarFallback>
                        {review.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-white">
                      {review.user.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <StarIcon size={14} className="fill-white text-white" />
                    <span className="text-xs font-bold text-white">
                      {review.rating}
                    </span>
                  </div>
                </div>

                {review.comment && (
                  <p className="pt-1 text-xs break-words text-gray-300">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            Esta barbearia ainda não possui avaliações. Seja o primeiro a
            avaliar!
          </p>
        )}
      </div>
    </div>
  );
}
