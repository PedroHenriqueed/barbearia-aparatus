"use client";

import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { AvatarImage, Avatar, AvatarFallback } from "./ui/avatar";
import { Prisma } from "@/app/generated/prisma/client";
import { format, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Image from "next/image";
import { Button } from "./ui/button";
import { Smartphone } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { cancelBooking } from "../_actions/cancel-booking";
import { toast } from "sonner";
import { useState } from "react";

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: true;
      barbershop: true;
    };
  }>;
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { executeAsync, isPending } = useAction(cancelBooking, {
    onSuccess: () => {
      toast.success("Reserva cancelada com sucesso!");
      setIsSheetOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cancelar reserva.");
    },
  });

  // Lógica atualizada: Confirmado APENAS se for futuro E não estiver cancelado
  const isBookingConfirmed = isFuture(booking.date) && !booking.cancelled;

  const handleCancelBooking = async () => {
    await executeAsync({ bookingId: booking.id });
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Telefone copiado!");
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Card className="bg-card hover:bg-secondary/10 min-w-full cursor-pointer rounded-xl border shadow-sm transition-colors">
          <CardContent className="flex justify-between p-0">
            {/* ESQUERDA */}
            <div className="flex flex-col gap-3 py-1 pl-5">
              <Badge
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold shadow-none ${
                  isBookingConfirmed
                    ? "bg-primary hover:bg-primary text-card rounded-full px-3 py-1"
                    : "bg-secondary text-muted-foreground hover:bg-secondary"
                }`}
              >
                {isBookingConfirmed ? "CONFIRMADO" : "FINALIZADO"}
              </Badge>
              <div className="mt-1">
                <h3 className="text-foreground text-base font-bold">
                  {booking.service.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={booking.barbershop.imageUrl} />
                    <AvatarFallback>
                      {booking.barbershop.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-foreground text-sm">
                    {booking.barbershop.name}
                  </p>
                </div>
              </div>
            </div>

            {/* DIREITA - DATA */}
            <div className="border-border flex w-[120px] flex-col items-center justify-center border-l px-1 py-1">
              <p className="text-foreground text-sm capitalize">
                {format(booking.date, "MMMM", { locale: ptBR })}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {format(booking.date, "dd")}
              </p>
              <p className="text-foreground text-sm">
                {format(booking.date, "HH:mm")}
              </p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="flex h-[90vh] flex-col overflow-hidden rounded-t-[20px] p-0 sm:h-[85vh]"
      >
        <SheetHeader className="border-border border-b p-5 text-left">
          <SheetTitle className="text-foreground text-lg font-bold">
            Informações da Reserva
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 pb-24 [&::-webkit-scrollbar]:hidden">
          {/* Mapa e Info da Barbearia */}
          <Card className="relative h-[180px] w-full overflow-hidden rounded-xl border-none p-0 shadow-none">
            <Image
              src="/maps.svg"
              alt="Mapa da barbearia"
              fill
              className="object-cover"
            />

            <div className="absolute right-4 bottom-4 left-4 w-[calc(100%-32px)]">
              <Card className="bg-card border-border flex items-center gap-3 rounded-lg p-3 shadow-sm">
                <Avatar>
                  <AvatarImage src={booking.barbershop.imageUrl} />
                  <AvatarFallback>{booking.barbershop.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <h3 className="text-foreground truncate font-bold">
                    {booking.barbershop.name}
                  </h3>
                  <p className="text-muted-foreground truncate overflow-hidden text-xs text-nowrap text-ellipsis">
                    {booking.barbershop.address}
                  </p>
                </div>
              </Card>
            </div>
          </Card>

          {/* Badge de Status */}
          <div className="mt-6 mb-6">
            <Badge
              className={`w-fit rounded-full px-3 py-1 text-xs font-bold shadow-none ${
                isBookingConfirmed
                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                  : "bg-secondary text-muted-foreground hover:bg-secondary"
              }`}
            >
              {isBookingConfirmed ? "CONFIRMADO" : "FINALIZADO"}
            </Badge>
          </div>

          {/* Detalhes do Serviço */}
          <Card className="border-border mb-6 rounded-xl border p-4 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-0">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-base font-bold">
                  {booking.service.name}
                </h3>
                <span className="text-foreground text-base font-bold">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(booking.service.priceInCents) / 100)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Data</span>
                <span className="text-foreground text-sm capitalize">
                  {format(booking.date, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Horário</span>
                <span className="text-foreground text-sm">
                  {format(booking.date, "HH:mm")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Barbearia</span>
                <span className="text-foreground text-sm">
                  {booking.barbershop.name}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Telefones */}
          <div className="flex flex-col gap-3">
            {booking.barbershop.phones.map((phone, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="text-foreground h-4 w-4" />
                  <span className="text-foreground text-sm">{phone}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-secondary rounded-full"
                  onClick={() => copyToClipboard(phone)}
                >
                  Copiar
                </Button>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="border-border bg-background flex flex-row gap-3 border-t p-5">
          <SheetClose asChild>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary h-12 flex-1 rounded-xl text-base font-bold"
            >
              Voltar
            </Button>
          </SheetClose>

          {/* Botão de cancelar só aparece se estiver CONFIRMADO */}
          {isBookingConfirmed && (
            <Button
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-12 flex-1 rounded-xl text-base font-bold"
              onClick={handleCancelBooking}
              disabled={isPending}
            >
              {isPending ? "Cancelando..." : "Cancelar Reserva"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BookingItem;
