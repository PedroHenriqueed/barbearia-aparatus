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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/app/_components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";

interface ServiceItemProps {
  service: BarbershopService;
  barbershop: Pick<Barbershop, "name" | "imageUrl" | "address" | "phones">;
}

export default function ServiceItem({ service, barbershop }: ServiceItemProps) {
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [step, setStep] = useState<"calendar" | "confirmation">("calendar");
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [date, setDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Lista de horários fixa
  const timeList = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  // Lógica para gerar os dias do calendário
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo

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

  const handleBookingSubmit = () => {
    setStep("confirmation");
  };

  const handleBack = () => {
    setStep("calendar");
  };

  const handleCancel = () => {
    setSheetIsOpen(false);
    setStep("calendar");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long" });
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const formattedSelectedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  const isSelected = (d: Date) => {
    return (
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
              if (!open) setStep("calendar");
            }}
          >
            <SheetTrigger asChild>
              <Button
                variant="default"
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
                <SheetTitle className="text-lg font-bold">
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
                        <h3 className="text-base font-bold">
                          {capitalizedMonth}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-border hover:bg-secondary h-8 w-8 rounded-full bg-transparent"
                            onClick={handlePrevMonth}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-border hover:bg-secondary h-8 w-8 rounded-full bg-transparent"
                            onClick={handleNextMonth}
                          >
                            <ChevronRight className="h-4 w-4" />
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
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${isSelectedDay ? "bg-primary text-primary-foreground" : ""} ${!dayObj.currentMonth && !isSelectedDay ? "text-muted-foreground/30" : "text-foreground"} ${dayObj.currentMonth && !isSelectedDay ? "hover:bg-secondary cursor-pointer" : ""} `}
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
                          {timeList.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                                selectedTime === time
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "text-muted-foreground border-border hover:bg-secondary bg-transparent"
                              } `}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumo do Pedido */}
                    {selectedTime && date && (
                      <Card className="rounded-xl border p-4 shadow-sm">
                        <CardContent className="flex flex-col gap-3 p-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold">
                              {service.name}
                            </h3>
                            <span className="text-base font-bold">
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
                      variant="default"
                      className="h-12 w-full rounded-xl text-base font-bold"
                      disabled={!selectedTime || !date}
                      onClick={handleBookingSubmit}
                    >
                      Confirmar
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
                        <Avatar className="top-16 left-5 h-[43px] w-[43px] ">
                          <AvatarImage src={barbershop.imageUrl} />
                          <AvatarFallback>{barbershop.name[0]}</AvatarFallback>
                        </Avatar>
                        <Card className="flex items-center gap-3 rounded-lg py-5 shadow-sm">
                          <div className="flex flex-col overflow-hidden">
                            <h3 className="truncate font-bold">
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
                    <div className="mt-6 mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-secondary hover:bg-secondary text-primary rounded-full px-3 py-1"
                      >
                        CONFIRMADO
                      </Badge>
                    </div>

                    {/* Detalhes da Reserva */}
                    <Card className="mb-6 rounded-xl border p-4 shadow-sm">
                      <CardContent className="flex flex-col gap-3 p-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold">
                            {service.name}
                          </h3>
                          <span className="text-base font-bold">
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
                            <i className="fi fi-rr-smartphone text-foreground"></i>
                            <span className="text-sm">{phone}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
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
                      className="h-12 flex-1 rounded-xl text-base font-bold"
                      onClick={handleBack}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-12 flex-1 rounded-xl text-base font-bold"
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
