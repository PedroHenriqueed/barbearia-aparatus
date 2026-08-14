"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Barbershop, BarbershopService } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { format, set } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet,
  Calendar1,
  Sparkles,
} from "lucide-react";

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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";

import { createBookingCheckoutSession } from "@/app/_actions/create-booking-checkout-session";
import {
  getDateAvailableTimeSlots,
  TimeSlot,
} from "@/app/_actions/get-date-available-time-slots";
import { createInPersonBooking } from "@/app/_actions/create-booking";
import { joinWaitlist } from "@/app/_actions/join-waitlist";
import { checkUserSubscription } from "@/app/_actions/check-subscription";
import { createSubscriberBooking } from "@/app/_actions/create-subscriber-booking";
import { authClient } from "@/lib/auth-client";
import { generateGoogleCalendarUrl } from "@/lib/utils";

interface ServiceItemProps {
  service: BarbershopService;
  barbershop: Pick<
    Barbershop,
    "id" | "name" | "imageUrl" | "address" | "phones"
  >;
}

export default function ServiceItem({ service, barbershop }: ServiceItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const serviceIdParam = searchParams.get("serviceId");

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState<string>("");

  const [sheetIsOpen, setSheetIsOpen] = useState(serviceIdParam === service.id);

  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState<"IN_PERSON" | "ONLINE">(
    "IN_PERSON",
  );

  const { data: session } = authClient.useSession();

  // 1. Checa se o usuário possui assinatura ativa nesta barbearia
  const { data: isSubscribed } = useQuery({
    queryKey: ["user-subscription", service.babershopId, session?.user?.id],
    queryFn: () => checkUserSubscription({ barbershopId: service.babershopId }),
    enabled: !!session?.user?.id && !!service.babershopId,
  });

  // Busca horários disponíveis e ocupados
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

  // Action 2: Pagamento na Barbearia
  const { executeAsync: executeInPersonBooking, isPending: isInPersonPending } =
    useAction(createInPersonBooking, {
      onSuccess: () => {
        toast.success("Agendamento realizado com sucesso!");
        queryClient.invalidateQueries({
          queryKey: ["date-available-time-slots", service.babershopId, date],
        });

        if (date && selectedTime) {
          const [hour, minute] = selectedTime.split(":").map(Number);
          const bookingDate = set(date, { hours: hour, minutes: minute });
          const url = generateGoogleCalendarUrl({
            title: `${service.name} - ${barbershop.name}`,
            description: `Serviço: ${service.name}\nBarbearia: ${barbershop.name}`,
            location: barbershop.address,
            startDate: bookingDate,
          });
          setCalendarUrl(url);
        }

        setSheetIsOpen(false);
        setShowSuccessDialog(true);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao realizar agendamento.");
      },
    });

  // Action 3: Agendamento Gratuito via Assinatura
  const {
    executeAsync: executeSubscriberBooking,
    isPending: isSubscriberPending,
  } = useAction(createSubscriberBooking, {
    onSuccess: () => {
      toast.success("Agendamento realizado com sucesso pelo seu Plano!");
      queryClient.invalidateQueries({
        queryKey: ["date-available-time-slots", service.babershopId, date],
      });

      if (date && selectedTime) {
        const [hour, minute] = selectedTime.split(":").map(Number);
        const bookingDate = set(date, { hours: hour, minutes: minute });
        const url = generateGoogleCalendarUrl({
          title: `${service.name} - ${barbershop.name}`,
          description: `Serviço: ${service.name}\nBarbearia: ${barbershop.name}`,
          location: barbershop.address,
          startDate: bookingDate,
        });
        setCalendarUrl(url);
      }

      setSheetIsOpen(false);
      setShowSuccessDialog(true);
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError || "Erro ao realizar agendamento pelo plano.",
      );
    },
  });

  // Action 4: Ativar Notificação "Avise-me"
  const { executeAsync: executeJoinWaitlist, isPending: isWaitlistPending } =
    useAction(joinWaitlist, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success("Te avisaremos se este horário vagar! 🔔");
          queryClient.invalidateQueries({
            queryKey: ["date-available-time-slots", service.babershopId, date],
          });
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao ativar o aviso.");
      },
    });

  const isPending =
    isOnlinePending ||
    isInPersonPending ||
    isWaitlistPending ||
    isSubscriberPending;

  const timeList: TimeSlot[] = availableTimesSlots || [];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDayOfMonth.getDay();

    for (let i = startDayOfWeek; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), currentMonth: false });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
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

  const handleDateClick = (selectedDate: Date) => {
    setDate(selectedDate);
    setSelectedTime(undefined);
  };

  const handleBookingSubmit = async () => {
    if (!session?.user) {
      toast.error("Você precisa fazer login para reservar!");
      await authClient.signIn.social({ provider: "google" });
      return;
    }

    if (!selectedTime || !date) return;

    const [hour, minute] = selectedTime.split(":").map(Number);
    const bookingDate = set(date, { hours: hour, minutes: minute });

    // Se for assinante, cria a reserva de graça
    if (isSubscribed) {
      await executeSubscriberBooking({
        serviceId: service.id,
        date: bookingDate,
      });
      return;
    }

    if (paymentMethod === "ONLINE") {
      await executeOnlineBooking({ serviceId: service.id, date: bookingDate });
    } else {
      await executeInPersonBooking({
        serviceId: service.id,
        date: bookingDate,
      });
    }
  };

  const handleJoinWaitlistClick = async (slotTime: string) => {
    if (!session?.user) {
      toast.error("Você precisa fazer login para ativar o aviso!");
      await authClient.signIn.social({ provider: "google" });
      return;
    }

    if (!date) return;

    const [hour, minute] = slotTime.split(":").map(Number);

    const waitlistDate = set(date, {
      hours: hour,
      minutes: minute,
      seconds: 0,
      milliseconds: 0,
    });

    await executeJoinWaitlist({
      barbershopId: service.babershopId,
      serviceId: service.id,
      date: waitlistDate,
    });
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setSelectedTime(undefined);
    router.push("/bookings");
  };

  const capitalizedMonth = format(currentMonth, "MMMM", {
    locale: ptBR,
  }).replace(/^./, (str) => str.toUpperCase());

  const formattedSelectedDate = date
    ? format(date, "dd 'de' MMMM", { locale: ptBR })
    : "";

  const isSelected = (d: Date) =>
    date &&
    d.getDate() === date.getDate() &&
    d.getMonth() === date.getMonth() &&
    d.getFullYear() === date.getFullYear();

  return (
    <>
      <Card className="border-border flex w-full flex-row items-center gap-3 overflow-hidden rounded-xl border p-3 shadow-sm">
        {/* Imagem do Serviço */}
        <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-lg">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Conteúdo do Card */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <h3 className="text-foreground truncate text-sm font-semibold">
            {service.name}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs break-words">
            {service.description}
          </p>

          <div className="mt-3 flex w-full items-center justify-between gap-2">
            {/* Exibição do Preço (Ajustada para Assinantes) */}
            {isSubscribed ? (
              <span className="flex items-center gap-1 rounded-full border border-zinc-500/30 px-2.5 py-1 text-xs font-bold text-foreground">
             Plano VIP
              </span>
            ) : (
              <span className="text-foreground shrink-0 text-sm font-bold">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.priceInCents) / 100)}
              </span>
            )}

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
                  className="shrink-0 rounded-full bg-[#ffffff] px-4 text-xs font-bold text-black hover:bg-[#ffffff]/70"
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
                              }`}
                            >
                              {dayObj.date.getDate()}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horários e Alerta "Avise-me" */}
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
                          timeList.map((slot) => {
                            if (slot.available) {
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => setSelectedTime(slot.time)}
                                  className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                                    selectedTime === slot.time
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border text-muted-foreground hover:bg-secondary bg-transparent"
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              );
                            }

                            if (slot.isBooked) {
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={isWaitlistPending}
                                  onClick={() =>
                                    handleJoinWaitlistClick(slot.time)
                                  }
                                  className="rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium whitespace-nowrap text-amber-400 transition-all hover:bg-amber-500/20 active:scale-95"
                                >
                                  {slot.time} • Avise-me
                                </button>
                              );
                            }

                            return (
                              <button
                                key={slot.time}
                                type="button"
                                disabled
                                className="border-border/30 text-muted-foreground/30 cursor-not-allowed rounded-full border bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap opacity-40"
                              >
                                {slot.time}
                              </button>
                            );
                          })
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

                  {/* Forma de Pagamento / Banner de Assinante */}
                  {selectedTime &&
                    date &&
                    (isSubscribed ? (
                      <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-400">
                        <Sparkles className="h-6 w-6 shrink-0 text-amber-400" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">
                            Assinatura Ativa
                          </span>
                          <span className="text-xs text-amber-300/80">
                            Este agendamento é coberto pelo seu plano e não terá
                            custo adicional.
                          </span>
                        </div>
                      </div>
                    ) : (
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
                    ))}

                  {/* Resumo do Pedido */}
                  {selectedTime && date && (
                    <Card className="border-border rounded-xl border p-4 shadow-sm">
                      <CardContent className="flex flex-col gap-3 p-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-foreground text-base font-bold">
                            {service.name}
                          </h3>
                          <span
                            className={`text-base font-bold ${isSubscribed ? "text-amber-400" : "text-foreground"}`}
                          >
                            {isSubscribed
                              ? "R$ 0,00"
                              : Intl.NumberFormat("pt-BR", {
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
                            {isSubscribed
                              ? "Plano VIP (Incluso)"
                              : paymentMethod === "ONLINE"
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
                      : isSubscribed
                        ? "Confirmar Agendamento"
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

      {/* MODAL DE PERGUNTA PÓS-AGENDAMENTO */}
      <AlertDialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseSuccessDialog();
        }}
      >
        <AlertDialogContent className="border-border w-[90%] max-w-[400px] rounded-2xl bg-zinc-950 text-center text-white">
          <AlertDialogHeader className="items-center text-center">
            <AlertDialogTitle className="text-center text-lg font-bold">
              Agendamento Confirmado!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-zinc-400">
              Sua reserva foi realizada com sucesso. Deseja salvá-la no seu
              Google Agenda para não esquecer?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex flex-col gap-2 sm:flex-col">
            <Button
              asChild
              className="h-11 w-full gap-2 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700"
            >
              <a
                href={calendarUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setShowSuccessDialog(false);
                  setTimeout(() => {
                    router.push("/bookings");
                  }, 300);
                }}
              >
                <Calendar1 size={18} />
                Adicionar ao Google Agenda
              </a>
            </Button>

            <AlertDialogCancel
              className="border-border mt-0 h-11 w-full rounded-xl bg-transparent text-white hover:bg-zinc-900"
              onClick={handleCloseSuccessDialog}
            >
              Agora não
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
