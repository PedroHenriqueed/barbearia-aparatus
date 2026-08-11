"use client";

import { Button } from "@/app/_components/ui/button";
import { Barbershop, BarbershopService } from "@prisma/client";
import {
  ChevronLeftIcon,
  HeartIcon,
  MapPinIcon,
  MenuIcon,
  SmartphoneIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ServiceItem from "./service-item";
import SidebarSheet from "@/app/_components/sidebar-sheet";
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet";
import { authClient } from "@/lib/auth-client";

interface BarbershopDetailsProps {
  barbershop: Barbershop & {
    services: BarbershopService[];
  };
  initialFavorite?: boolean;
}

export default function BarbershopDetails({
  barbershop,
  initialFavorite = false,
}: BarbershopDetailsProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const handleBackClick = () => {
    router.back();
  };

  const handleCopyPhoneClick = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success("Telefone copiado com sucesso!");
  };

  const handleToggleFavorite = async () => {
    if (!session?.user) {
      toast.error("Você precisa estar logado para favoritar!");
      await authClient.signIn.social({ provider: "google" });
      return;
    }

    try {
      setIsFavoriteLoading(true);
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barbershopId: barbershop.id }),
      });

      if (response.ok) {
        setIsFavorite((prev) => !prev);
        toast.success(
          isFavorite
            ? "Barbearia removida dos favoritos!"
            : "Barbearia adicionada aos favoritos!",
        );
      } else {
        toast.error("Erro ao atualizar favoritos.");
      }
    } catch {
      toast.error("Erro ao atualizar favoritos.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-6">
      {/* Imagem do Banner / Header */}
      <div className="relative h-[250px] w-full">
        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover"
          priority
        />

        {/* Botões Superiores */}
        <div className="absolute top-4 right-4 left-4 z-10 flex items-center justify-between">
          <Button
            size="icon"
            variant="secondary"
            className="bg-background/80 h-9 w-9 rounded-full backdrop-blur-sm"
            onClick={handleBackClick}
          >
            <ChevronLeftIcon size={18} />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="bg-background/80 h-9 w-9 rounded-full backdrop-blur-sm"
              disabled={isFavoriteLoading}
              onClick={handleToggleFavorite}
            >
              <HeartIcon
                size={18}
                className={
                  isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
                }
              />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-background/80 h-9 w-9 rounded-full backdrop-blur-sm"
                >
                  <MenuIcon size={18} />
                </Button>
              </SheetTrigger>
              <SidebarSheet />
            </Sheet>
          </div>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="border-border space-y-2 border-b p-5">
        <h1 className="text-foreground truncate text-xl font-bold">
          {barbershop.name}
        </h1>

        <div className="flex items-center gap-2">
          <MapPinIcon size={16} className="text-primary shrink-0" />
          <p className="text-muted-foreground truncate text-sm">
            {barbershop.address}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StarIcon size={16} className="fill-primary text-primary shrink-0" />
          <p className="text-foreground text-sm font-semibold">5,0</p>
          <p className="text-muted-foreground text-xs">(83 avaliações)</p>
        </div>
      </div>

      {/* Seção de Serviços */}
      <div className="w-full max-w-full space-y-3 overflow-hidden p-5">
        <h2 className="text-muted-foreground text-xs font-bold uppercase">
          Serviços
        </h2>
        <div className="flex w-full max-w-full min-w-0 flex-col gap-3">
          {barbershop.services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              barbershop={barbershop}
            />
          ))}
        </div>
      </div>

      {/* Seção de Contato */}
      <div className="w-full max-w-full space-y-3 overflow-hidden p-5">
        <h2 className="text-muted-foreground text-xs font-bold uppercase">
          Contato
        </h2>
        <div className="flex flex-col gap-3">
          {barbershop.phones.map((phone) => (
            <div
              key={phone}
              className="flex w-full min-w-0 items-center justify-between gap-2"
            >
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <SmartphoneIcon
                  size={16}
                  className="text-foreground shrink-0"
                />
                <p className="text-foreground truncate text-sm">{phone}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full"
                onClick={() => handleCopyPhoneClick(phone)}
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
