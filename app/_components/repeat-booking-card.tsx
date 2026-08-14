"use client";

import { Prisma } from "@prisma/client";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Avatar, AvatarImage } from "@/app/_components/ui/avatar";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface RepeatBookingCardProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: true;
      barbershop: true;
    };
  }>;
}

const RepeatBookingCard = ({ booking }: RepeatBookingCardProps) => {
  const router = useRouter();

  const handleRepeatBooking = () => {
    const barbershopId = booking.babershopId || booking.barbershop?.id;
    const serviceId = booking.servicesId || booking.service?.id;

    router.push(`/barbershops/${barbershopId}?serviceId=${serviceId}`);
  };

  return (
    <Card className="border-zinc-800 bg-black">
      <CardContent className="flex flex-row items-center justify-between p-0">
        {/* Esquerda: Serviço e Barbearia */}
        <div className="flex flex-col gap-2 py-5 pr-2 pl-5">
          <h3 className="text-sm font-bold text-white">
            {booking.service.name}
          </h3>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={booking.barbershop.imageUrl}
                alt={booking.barbershop.name}
                className="object-cover"
              />
            </Avatar>
            <p className="text-xs text-gray-400">{booking.barbershop.name}</p>
          </div>
        </div>

        {/* Direita: Botão de Repetir */}
        <div className="flex min-w-[120px] items-center justify-center border-l border-solid border-zinc-800 px-6 py-5">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 font-bold"
            onClick={handleRepeatBooking}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Repetir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepeatBookingCard;
