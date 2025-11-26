"use client";

import { Card} from "./ui/card";
import { Badge } from "./ui/badge";
import { AvatarImage, Avatar} from "./ui/avatar";
import { Prisma } from "@/app/generated/prisma/client";
import { format, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

// Define o tipo esperado com as relações incluídas
interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: true;
      barbershop: true;
    };
  }>;
}

const BookingItem = ({ booking }: BookingItemProps) => {
  // Um agendamento é confirmado se a data for futura. Caso contrário, é finalizado.
  const isBookingConfirmed = isFuture(booking.date);

  return (
    <Card className="flex w-full min-w-full flex-row items-center justify-between p-0">
      {/* ESQUERDA */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Badge
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
            isBookingConfirmed
              ? "bg-primary hover:bg-primary text-card rounded-full px-3 py-1"
              : "bg-secondary text-muted-foreground hover:bg-secondary"
          }`}
        >
          {isBookingConfirmed ? "CONFIRMADO" : "FINALIZADO"}
        </Badge>
        <div className="flex flex-col gap-2">
          <p className="font-bold">{booking.barbershop.name}</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={booking.barbershop.imageUrl} />
            </Avatar>
            <p className="text-muted-foreground text-sm">
              {booking.barbershop.name}
            </p>
          </div>
        </div>
      </div>
      {/* DIREITA */}
      <div className="border-secondary flex w-[100px] flex-col items-center justify-center border-l border-solid px-5 py-5">
        <p className="text-foreground text-sm capitalize">
          {format(booking.date, "MMMM", { locale: ptBR })}
        </p>
        <p className="text-foreground text-2xl font-bold">
          {format(booking.date, "dd")}
        </p>
        <p className="text-foreground text-sm capitalize">
          {format(booking.date, "HH:mm")}
        </p>
      </div>
    </Card>
  );
};
export default BookingItem;
