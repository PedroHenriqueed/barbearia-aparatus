"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Barbershop, BarbershopService } from "@/app/generated/prisma/client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/app/_components/ui/badge";
import { useAction } from "next-safe-action/hooks";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { createBooking } from "@/app/_actions/create-booking";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDateAvailableTimeSlots } from "@/app/_actions/get-date-available-time-slots";


interface ServiceItemProps {
  service: BarbershopService;
  barbershop: Pick<Barbershop, "name" | "imageUrl" | "address" | "phones">;
}

export default function ServiceItem({ service, barbershop }: ServiceItemProps) {
  const queryClient = useQueryClient();
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [step, setStep] = useState<"calendar" | "confirmation">("calendar");
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Busca horários disponíveis no servidor
  const { data: availableTimesSlots, isFetching } = useQuery({
    queryKey: ["date-available-time-slots", service.babershopId, date],
    queryFn: () =>
      getDateAvailableTimeSlots({
        babershopId: service.babershopId,
        date: date!,
      }),
    enabled: !!date,
  });

  const { executeAsync, isPending } = useAction(createBooking, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      // Invalida a query para forçar uma atualização imediata da lista de horários
      queryClient.invalidateQueries({
        queryKey: ["date-available-time-slots"],
      });
      setStep("confirmation");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar agendamento.");
    },
  });

  // Usa a lista do servidor se disponível, senão array vazio
  const timeList = availableTimesSlots || [];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDayOfMonth.getDay();

    for (let i = startDayOfWeek; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, currentMonth: false });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, currentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, currentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleDateClick = (date: Date) => {
    setDate(date);
    setSelectedTime(undefined);
  };

  const handleBookingSubmit = async () => {
    if (!selectedTime || !date) return;

    const timeParts = selectedTime.split(":");
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);

    const bookingDate = new Date(date);
    bookingDate.setHours(hour, minute, 0, 0);

    await executeAsync({
      serviceId: service.id,
      date: bookingDate,
    });
  };

  const handleBack = () => {
    setStep("calendar");
    // Opcional: Limpar a seleção ao voltar para o calendário
    setSelectedTime(undefined);
  };

  const handleCancel = () => {
    setSheetIsOpen(false);
    setStep("calendar");
    setSelectedTime(undefined);
    setDate(new Date());
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Telefone copiado!");
    }
  };

  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long" });
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const formattedSelectedDate = date?.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  const isSelected = (d: Date) => {
    return (
      date &&
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  };

  return (
    <Card className="border-border flex min-w-full flex-row items-center gap-3 rounded-xl border p-3 shadow-sm">
      <div className="relative h-[110px] min-h-[110px] w-[110px] min-w-[110px] overflow-hidden rounded-lg">
        <Image
          src={service.imageUrl}
          alt={service.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex w-full flex-col">
        <h3 className="text-foreground text-sm font-semibold">
          {service.name}
        </h3>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
          {service.description}
        </p>

        <div className="mt-3 flex w-full items-center justify-between">
          <span className="text-foreground text-sm font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.priceInCents) / 100)}
          </span>

          <Sheet
            open={sheetIsOpen}
            onOpenChange={(open) => {
              setSheetIsOpen(open);
              if (!open) {
                setStep("calendar");
                setSelectedTime(undefined);
              }
            }}
          >
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                className="rounded-full px-4 text-xs font-bold"
                size="sm"
              >
                Reservar
              </Button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="flex h-[90vh] flex-col overflow-hidden rounded-t-[20px] p-0 sm:h-[85vh]"
            >
              <SheetHeader className="border-border border-b p-5 text-left">
                <SheetTitle className="text-foreground text-lg font-bold">
                  {step === "calendar"
                    ? "Fazer Reserva"
                    : "Informações da Reserva"}
                </SheetTitle>
              </SheetHeader>

              {step === "calendar" && (
                <>
                  <div className="flex-1 overflow-y-auto p-5 pb-24 [&::-webkit-scrollbar]:hidden">
                    {/* Calendário */}
                    <div className="mb-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-foreground text-base font-bold">
                          {capitalizedMonth}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-border hover:bg-secondary h-8 w-8 rounded-full bg-transparent"
                            onClick={handlePrevMonth}
                          >
                            <ChevronLeft className="text-foreground h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-border hover:bg-secondary h-8 w-8 rounded-full bg-transparent"
                            onClick={handleNextMonth}
                          >
                            <ChevronRight className="text-foreground h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-2 grid grid-cols-7 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(
                          (day) => (
                            <span
                              key={day}
                              className="text-muted-foreground text-xs font-medium uppercase"
                            >
                              {day}
                            </span>
                          ),
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-2 text-center">
                        {calendarDays.map((dayObj, i) => {
                          const isSelectedDay = isSelected(dayObj.date);
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-center"
                            >
                              <button
                                onClick={() => handleDateClick(dayObj.date)}
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                                  isSelectedDay
                                    ? "bg-primary text-primary-foreground"
                                    : ""
                                } ${
                                  !dayObj.currentMonth && !isSelectedDay
                                    ? "text-muted-foreground/30"
                                    : "text-foreground"
                                } ${
                                  dayObj.currentMonth && !isSelectedDay
                                    ? "hover:bg-secondary cursor-pointer"
                                    : ""
                                } `}
                              >
                                {dayObj.date.getDate()}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horários */}
                    {date && (
                      <div className="mb-6">
                        <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                          {isFetching ? (
                            <div className="flex w-full items-center justify-center p-4">
                              <span className="text-muted-foreground text-xs">
                                Carregando horários...
                              </span>
                            </div>
                          ) : timeList.length > 0 ? (
                            timeList.map((time) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                                  selectedTime === time
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border text-muted-foreground hover:bg-secondary bg-transparent"
                                } `}
                              >
                                {time}
                              </button>
                            ))
                          ) : (
                            <div className="flex w-full items-center justify-center p-4">
                              <span className="text-muted-foreground text-xs">
                                Não há horários disponíveis para este dia.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resumo do Pedido */}
                    {selectedTime && date && (
                      <Card className="border-border rounded-xl border p-4 shadow-sm">
                        <CardContent className="flex flex-col gap-3 p-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-foreground text-base font-bold">
                              {service.name}
                            </h3>
                            <span className="text-foreground text-base font-bold">
                              {Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(service.priceInCents) / 100)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Data
                            </span>
                            <span className="text-foreground text-sm capitalize">
                              {formattedSelectedDate}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Horário
                            </span>
                            <span className="text-foreground text-sm">
                              {selectedTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Barbearia
                            </span>
                            <span className="text-foreground text-sm">
                              {barbershop.name}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <SheetFooter className="border-border bg-background border-t p-5">
                    <Button
                      className="h-12 w-full rounded-xl text-base font-bold"
                      disabled={!selectedTime || !date || isPending}
                      onClick={handleBookingSubmit}
                    >
                      {isPending ? "Confirmando..." : "Confirmar"}
                    </Button>
                  </SheetFooter>
                </>
              )}

              {step === "confirmation" && (
                <>
                  <div className="flex-1 overflow-y-auto p-5 pb-24 [&::-webkit-scrollbar]:hidden">
                    {/* Mapa e Info da Barbearia */}
                    <Card className="relative h-[180px] w-full overflow-hidden rounded-xl border-none p-0 shadow-none">
                      <Image
                        src="/maps.svg"
                        alt="Mapa da barbearia"
                        fill
                        className="object-cover"
                      />

                      {/* Card flutuante com info da barbearia */}
                      <div className="absolute right-4 bottom-4 left-4 w-[calc(100%-32px)]">
                        <Card className="bg-card border-border flex items-center gap-3 rounded-lg p-3 shadow-sm">
                          <Avatar>
                            <AvatarImage src={barbershop.imageUrl} />
                            <AvatarFallback>
                              {barbershop.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col overflow-hidden">
                            <h3 className="text-foreground truncate font-bold">
                              {barbershop.name}
                            </h3>
                            <p className="text-muted-foreground truncate overflow-hidden text-xs text-nowrap text-ellipsis">
                              {barbershop.address}
                            </p>
                          </div>
                        </Card>
                      </div>
                    </Card>

                    {/* Badge Confirmado - Alinhado à esquerda */}
                    <div className="mt-6 mb-6">
                      <Badge
                        variant="secondary"
                        className="bg-secondary text-primary hover:bg-secondary rounded-full px-3 py-1"
                      >
                        CONFIRMADO
                      </Badge>
                    </div>

                    {/* Detalhes da Reserva */}
                    <Card className="border-border mb-6 rounded-xl border p-4 shadow-sm">
                      <CardContent className="flex flex-col gap-3 p-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-foreground text-base font-bold">
                            {service.name}
                          </h3>
                          <span className="text-foreground text-base font-bold">
                            {Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(service.priceInCents) / 100)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            Data
                          </span>
                          <span className="text-foreground text-sm capitalize">
                            {formattedSelectedDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            Horário
                          </span>
                          <span className="text-foreground text-sm">
                            {selectedTime}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            Barbearia
                          </span>
                          <span className="text-foreground text-sm">
                            {barbershop.name}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Telefones */}
                    <div className="flex flex-col gap-3">
                      {barbershop.phones.map((phone, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Smartphone className="text-foreground h-4 w-4" />
                            <span className="text-foreground text-sm">
                              {phone}
                            </span>
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
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-secondary h-12 flex-1 rounded-xl text-base font-bold"
                      onClick={handleBack}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-12 flex-1 rounded-xl text-base font-bold"
                      onClick={handleCancel}
                    >
                      Cancelar Reserva
                    </Button>
                  </SheetFooter>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Card>
  );
}
