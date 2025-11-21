"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Separator } from "@/app/_components/ui/separator";
import { ArrowLeft } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/_components/ui/footer";
import ServiceItem from "./service-item";
import { Barbershop, BarbershopService } from "@/app/generated/prisma/client";

interface BarbershopDetailsProps {
  barbershop: Barbershop & {
    services: BarbershopService[];
  };
}

export default function BarbershopDetails({
  barbershop,
}: BarbershopDetailsProps) {
  function copyToClipboard(phone: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(phone);
    }
  }

  return (
    <div className="bg-background min-h-screen w-full overflow-hidden rounded-none">
      <div className="relative h-75 w-full">
        <Link href="/" className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            className="bg-background/50 hover:bg-background/80 rounded-full border-none backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover opacity-90"
          priority
        />
      </div>
      <Card className="relative z-20 -mt-8 rounded-t-3xl rounded-b-none border-none shadow-none">
        <CardContent className="px-5 pt-6 pb-2">
          <div className="mb-2 flex items-center gap-3">
            <Avatar className="border-background size-12 border-2">
              <AvatarImage src={barbershop.imageUrl} />
              <AvatarFallback>{barbershop.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-foreground text-xl font-bold">
                {barbershop.name}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1 text-sm">
                <i className="fi fi-rr-marker text-primary text-xs"></i>
                {barbershop.address}
              </p>
            </div>
          </div>

          <Separator className="my-6" />
          <div>
            <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
              SOBRE NÓS
            </h2>
            <p className="text-muted-foreground text-justify text-sm leading-relaxed">
              {barbershop.description}
            </p>
          </div>
          <Separator className="my-6" />
          <div>
            <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
              SERVIÇOS
            </h2>
            <div className="flex flex-col gap-3">
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
              {barbershop.phones.map((phone) => (
                <div
                  key={phone}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-smartphone text-foreground"></i>
                    <span className="text-foreground text-sm">{phone}</span>
                  </div>
                  <Button
                    variant="secondary"
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
        </CardContent>
        <Footer />
      </Card>
    </div>
  );
}
