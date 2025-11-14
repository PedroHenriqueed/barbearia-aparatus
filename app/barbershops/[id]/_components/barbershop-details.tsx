"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Separator } from "@/app/_components/ui/separator";
import { ArrowLeft, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/_components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/_components/ui/footer";

type BarbershopService = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInCents: number;
};

type Barbershop = {
  id: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  phones: string[];
  services: BarbershopService[];
};

interface BarbershopDetailsProps {
  barbershop: Barbershop;
}

export default function BarbershopDetails({ barbershop }: BarbershopDetailsProps) {
  function copyToClipboard(phone: string) {
    navigator.clipboard.writeText(phone);
  }

  return (
    <div className="min-h-screen bg-background rounded-none overflow-hidden w-full">
      <div className="relative h-75 w-full">
        <Link href="/" className="fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover"
          priority
        />
      </div>
      <Card className="rounded-t-2xl -mt-8 relative z-20">
        <CardContent className="pt-6 pb-2">
        <div className="flex items-center gap-3 mb-2">
            <Avatar className="size-10">
                <AvatarImage src={barbershop.imageUrl} />
                <AvatarFallback>{barbershop.name[0]}
                </AvatarFallback>
            </Avatar>
            <div>
            <h1 className="text-2xl font-bold text-foreground">{barbershop.name}</h1>
            <p className="text-muted-foreground text-sm">{barbershop.address}</p>
        </div>
            </div>
          
          <Separator className="my-4" />
          <div>
            <h2 className="text-xs font-bold text-foreground mb-1">SOBRE NÓS</h2>
            <p className="text-sm text-muted-foreground">{barbershop.description}</p>
          </div>
          <Separator className="my-4" />
          <div>
            <h2 className="text-xs font-bold text-foreground mb-2">SERVIÇOS</h2>
            <div className="flex flex-col gap-3">
            {barbershop.services.map(service => (
                <Card key={service.id} className="flex flex-row items-center gap-3 p-2 rounded-xl">
                    <div className="relative h-22 w-22 rounded-lg overflow-hidden">
                    <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover"
                    />
                    </div>
                    <div className="flex flex-col flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                    <div className="flex items-center gap-8 mt-1">
                    <span className="text-sm font-bold text-foreground mt-1">
                        R$ {(service.priceInCents / 100).toFixed(2).replace('.', ',')}
                    </span>
                    <Button variant="default" size="sm" className="rounded-full px-4">
                        Reservar
                    </Button>
                    </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                    
                    </div>
                </Card>
                ))}
            </div>
          </div>
          <Separator className="my-6" />
          <div>
            <h2 className="text-xs font-bold text-foreground mb-1">CONTATO</h2>
            <div className="flex flex-col gap-2">
              {barbershop.phones.map(phone => (
                <div key={phone} className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground ">{phone}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto rounded-full font-bold"
                    onClick={() => copyToClipboard(phone)}
                  >
                     Copiar
                  </Button>
                </div>
              ))}
            </div>
          </div>          
        </CardContent>
      </Card>
      <Footer/>
    </div>
  );
}