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
import { useState, useMemo} from "react";

interface ServiceItemProps {
  service: BarbershopService;
  barbershop: Pick<Barbershop, "name">;
}

export default function ServiceItem({ service, barbershop }: ServiceItemProps) {
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [date, setDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Lista de horários fixa (pode vir do banco futuramente)
  const timeList = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"

  ];

  // Lógica para gerar os dias do calendário
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Primeiro dia do mês
    const firstDayOfMonth = new Date(year, month, 1);
    // Último dia do mês
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];

    // Preencher dias do mês anterior para completar a semana
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo
    for (let i = startDayOfWeek; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, currentMonth: false });
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, currentMonth: true });
    }

    // Preencher dias do próximo mês para completar o grid (opcional, mas bom para visual)
    const remainingDays = 42 - days.length; // 6 linhas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, currentMonth: false });
    }

    return days;
  }, [currentMonth]);

  // Navegação entre meses
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
    setSelectedTime(undefined); // Reseta horário ao trocar dia
  };

  // Formatações
  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long" });
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const formattedSelectedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  // Verifica se o dia é o selecionado
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
          {/* Preço */}
          <span className="text-foreground text-sm font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.priceInCents) / 100)}
          </span>

          <Sheet>
            <SheetTrigger asChild>
              {/* Botão Reservar */}
              <Button
                className="rounded-full bg-[#3C6E48] px-4 text-xs font-bold text-white hover:bg-[#3C6E48]/90"
                size="sm"
              >
                Reservar
              </Button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="h-[90vh] rounded-t-[20px] p-0 sm:h-[85vh]"
            >
              <SheetHeader className="border-border border-b p-5 text-left">
                <SheetTitle className="text-lg font-bold">
                  Fazer Reserva
                </SheetTitle>
              </SheetHeader>

              <div className="h-full overflow-y-auto p-5 pb-24 [&::-webkit-scrollbar]:hidden">
                {/* Calendário Lógico */}
                <div className="mb-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold">{capitalizedMonth}</h3>
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

                  {/* Dias da Semana */}
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

                  {/* Grid de Dias */}
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
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${isSelectedDay ? "bg-[#3C6E48] text-white" : ""} ${!dayObj.currentMonth && !isSelectedDay ? "text-muted-foreground/30" : "text-foreground"} ${dayObj.currentMonth && !isSelectedDay ? "hover:bg-secondary cursor-pointer" : ""} `}
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
                              ? "border-[#3C6E48] bg-[#3C6E48] text-white"
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
                        <h3 className="text-base font-bold">{service.name}</h3>
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

              <SheetFooter className="border-border bg-background absolute right-0 bottom-0 left-0 border-t p-5">
                <Button
                  className="h-12 w-full rounded-xl bg-[#3C6E48] text-base font-bold text-white hover:bg-[#3C6E48]/90"
                  disabled={!selectedTime || !date}
                >
                  Confirmar
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Card>
  );
}
