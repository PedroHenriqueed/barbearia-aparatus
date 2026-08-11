"use client";

import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { AvatarImage, Avatar, AvatarFallback } from "./ui/avatar";
import { Prisma } from "@prisma/client";
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
import { CreditCard, Wallet, Smartphone } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { cancelBooking } from "../_actions/cancel-booking";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

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

  const isBookingConfirmed = isFuture(booking.date) && !booking.cancelled;
  const isPaid = booking.paymentStatus === "PAID";
  const isOnlinePayment = booking.paymentMethod === "ONLINE";

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
        {/* CARD PRINCIPAL */}
        <Card
          className={`min-w-full cursor-pointer rounded-xl border shadow-sm transition-all ${isBookingConfirmed
              ? "!bg-black border-zinc-400 hover:!bg-zinc-900 active:!bg-zinc-900"
              : "!bg-zinc-950/80 !border-zinc-500 opacity-60 hover:opacity-80"
            }`}
        >
          <CardContent className="flex justify-between p-0">
            {/* ESQUERDA */}
            <div className="flex flex-col gap-3 py-5 pl-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold shadow-none ${isBookingConfirmed
                      ? "!bg-zinc-800 !text-white hover:!bg-zinc-800"
                      : "!bg-zinc-800 !text-zinc-400 hover:!bg-zinc-800"
                    }`}
                >
                  {isBookingConfirmed ? "CONFIRMADO" : "FINALIZADO"}
                </Badge>

                {/* BADGE DE PAGAMENTO NO CARD */}
                <Badge
                  className={`flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-none ${isPaid
                      ? "!bg-emerald-950 !text-emerald-400 hover:!bg-emerald-950"
                      : "!bg-amber-950 !text-amber-400 hover:!bg-amber-950"
                    }`}
                >
                  {isOnlinePayment ? (
                    <CreditCard size={12} />
                  ) : (
                    <Wallet size={12} />
                  )}
                  {isPaid ? "PAGO ONLINE"
                    : isOnlinePayment
                      ? "AGUARDANDO PAGAMENTO"
                      : "PAGAR NO LOCAL"}
                </Badge>
              </div>

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
            <div className="border-border flex w-[120px] flex-col items-center justify-center border-l px-5 py-5">
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
                  <p className="text-muted-foreground truncate overflow-hidden text-nowrap text-xs text-ellipsis">
                    {booking.barbershop.address}
                  </p>
                </div>
              </Card>
            </div>
          </Card>

          {/* Badges de Status no Modal */}
          <div className="mt-6 mb-6 flex flex-wrap gap-2">
            <Badge
              className={`w-fit rounded-full px-3 py-1 text-xs font-bold shadow-none ${isBookingConfirmed
                  ? "!bg-zinc-800 !text-white hover:!bg-zinc-800"
                  : "!bg-zinc-800 !text-zinc-400 hover:!bg-zinc-800"
                }`}
            >
              {isBookingConfirmed ? "CONFIRMADO" : "FINALIZADO"}
            </Badge>

            <Badge
              className={`flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-none ${isPaid
                  ? "!bg-emerald-950 !text-emerald-400 hover:!bg-emerald-950"
                  : "!bg-amber-950 !text-amber-400 hover:!bg-amber-950"
                }`}
            >
              {isOnlinePayment ? (
                <CreditCard size={12} />
              ) : (
                <Wallet size={12} />
              )}
              {isPaid ? "PAGO ONLINE" : "PAGAMENTO PENDENTE (NO LOCAL)"}
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

              {/* Informações adicionais de Pagamento */}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                <span className="text-muted-foreground text-sm">Método</span>
                <span className="text-foreground text-sm font-medium">
                  {isOnlinePayment ? "Cartão (Online)" : "Na Barbearia"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Status Pagamento
                </span>
                <span
                  className={`text-sm font-bold ${isPaid ? "text-emerald-400" : "text-amber-400"
                    }`}
                >
                  {isPaid ? "Pago" : "Pendente"}
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

          {/* Botão de cancelar */}
          {isBookingConfirmed && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-red-500 text-white hover:bg-red-500/90 h-12 flex-1 rounded-xl text-base font-bold"
                  disabled={isPending}
                >
                  Cancelar Reserva
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border w-[90%] max-w-[400px] rounded-xl text-center">
                <AlertDialogHeader className="items-center text-center">
                  <AlertDialogTitle className="text-center">
                    Você tem certeza?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center">
                    Essa ação não pode ser desfeita. Isso cancelará permanentemente
                    sua reserva.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-row justify-center gap-3">
                  <AlertDialogCancel className="mt-0 h-10 flex-1 rounded-xl">
                    Voltar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isPending}
                    className="text-white bg-red-500 hover:bg-red-500/90 h-10 flex-1 rounded-xl"
                    onClick={handleCancelBooking}
                  >
                    {isPending ? "Cancelando..." : "Confirmar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BookingItem;