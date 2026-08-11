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
import { Barbershop, BarbershopService } from "@prisma/client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CreditCard, Wallet } from "lucide-react";
import { useState, useMemo } from "react";
import { useAction } from "next-safe-action/hooks";
import { createBookingCheckoutSession } from "@/app/_actions/create-booking-checkout-session";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDateAvailableTimeSlots } from "@/app/_actions/get-date-available-time-slots";
import { createInPersonBooking } from "@/app/_actions/create-booking";
import { format, set } from "date-fns";
import { ptBR } from "date-fns/locale";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface ServiceItemProps {
  service: BarbershopService;
  barbershop: Pick<Barbershop, "name" | "imageUrl" | "address" | "phones">;
}

export default function ServiceItem({ service, barbershop }: ServiceItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session } = authClient.useSession();

  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Estado da forma de pagamento escolhida
  const [paymentMethod, setPaymentMethod] = useState<"IN_PERSON" | "ONLINE">(
    "IN_PERSON",
  );

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

  // Action 1: Pagamento Online (Stripe)
  const { executeAsync: executeOnlineBooking, isPending: isOnlinePending } =
    useAction(createBookingCheckoutSession, {
      onSuccess: ({ data }) => {
        if (data?.url) {
          router.push(data.url);
        } else {
          toast.error("Erro ao criar sessão de pagamento.");
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao iniciar pagamento.");
      },
    });

  // Action 2: Pagamento na Barbearia (Prisma direto)
  const {
    executeAsync: executeInPersonBooking,
    isPending: isInPersonPending,
  } = useAction(createInPersonBooking, {
    onSuccess: () => {
      toast.success("Agendamento realizado com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["date-available-time-slots", service.babershopId, date],
      });
      setSheetIsOpen(false);
      setSelectedTime(undefined);
      router.push("/bookings");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao realizar agendamento.");
    },
  });

  const isPending = isOnlinePending || isInPersonPending;
  const timeList: string[] = availableTimesSlots || [];

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
    if (!session?.user) {
      toast.error("Você precisa fazer login para reservar!");
      await authClient.signIn.social({
        provider: "google",
      });
      return;
    }

    if (!selectedTime || !date) return;

    const timeParts = selectedTime.split(":");
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);

    const bookingDate = set(date, {
      hours: hour,
      minutes: minute,
    });

    if (paymentMethod === "ONLINE") {
      await executeOnlineBooking({
        serviceId: service.id,
        date: bookingDate,
      });
    } else {
      await executeInPersonBooking({
        serviceId: service.id,
        date: bookingDate,
      });
    }
  };

  const capitalizedMonth = format(currentMonth, "MMMM", {
    locale: ptBR,
  }).replace(/^./, (str) => str.toUpperCase());

  const formattedSelectedDate = date
    ? format(date, "dd 'de' MMMM", { locale: ptBR })
    : "";

  const isSelected = (d: Date) => {
    return (
      date &&
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  };

  return (
    <Card className="border-border flex w-full flex-row items-center gap-3 overflow-hidden rounded-xl border p-3 shadow-sm">
      <div className="relative h-[110px] min-h-[110px] w-[110px] min-w-[110px] overflow-hidden rounded-lg">
        <Image
          src={service.imageUrl}
          alt={service.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex w-full min-w-0 flex-col">
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
                setSelectedTime(undefined);
                setPaymentMethod("IN_PERSON");
              }
            }}
          >
            <SheetTrigger asChild>
              <Button
                color="#1546A1"
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
                  Fazer Reserva
                </SheetTitle>
              </SheetHeader>

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

                {/* Seleção da Forma de Pagamento */}
                {selectedTime && date && (
                  <div className="mb-6 flex flex-col gap-3">
                    <h3 className="text-foreground text-base font-bold">
                      Forma de Pagamento
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("IN_PERSON")}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                          paymentMethod === "IN_PERSON"
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Wallet className="h-5 w-5" />
                        <span className="text-xs">Pagar na Barbearia</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("ONLINE")}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                          paymentMethod === "ONLINE"
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="text-xs">Pagar Agora Online</span>
                      </button>
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

                      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                        <span className="text-muted-foreground text-sm">
                          Pagamento
                        </span>
                        <span className="text-foreground text-sm font-semibold">
                          {paymentMethod === "ONLINE"
                            ? "Cartão (Online)"
                            : "Na Barbearia"}
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
                  {isPending
                    ? "Processando..."
                    : paymentMethod === "ONLINE"
                      ? "Pagar e Confirmar"
                      : "Confirmar Agendamento"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Card>
  );
}