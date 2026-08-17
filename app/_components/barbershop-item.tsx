import Link from "next/link";
import { Barbershop, Review, OpeningHour } from "@prisma/client";
import Image from "next/image";
import { StarIcon } from "lucide-react";

interface BarbershopItemProps {
  barbershop: Barbershop & {
    reviews?: Review[];
    openingHours?: OpeningHour[];
  };
}

// Cálculo preciso do fuso horário de Brasília (compatível com SSR/Node)
function getBrazilTimeInfo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  let weekdayStr = "";
  let hour = 0;
  let minute = 0;

  for (const part of parts) {
    if (part.type === "weekday") weekdayStr = part.value;
    if (part.type === "hour") hour = parseInt(part.value, 10) % 24;
    if (part.type === "minute") minute = parseInt(part.value, 10);
  }

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayOfWeek = dayMap[weekdayStr] ?? now.getDay();
  const currentMinutes = hour * 60 + minute;

  return { dayOfWeek, currentMinutes };
}

export default function BarbershopItem({ barbershop }: BarbershopItemProps) {
  const totalReviews = barbershop.reviews?.length || 0;
  const averageRating =
    totalReviews > 0
      ? (
          barbershop.reviews!.reduce((acc, r) => acc + r.rating, 0) /
          totalReviews
        ).toFixed(1)
      : "Novo";

  const getStatus = () => {
    const { dayOfWeek, currentMinutes } = getBrazilTimeInfo();
    const barbershopHours = barbershop.openingHours;
    const hasConfig = barbershopHours && barbershopHours.length > 0;

    let isOpenDay = dayOfWeek !== 0; // Padrão caso não haja configuração: Segunda a Sábado aberto
    let startTime = "08:00";
    let endTime = "18:00";

    if (hasConfig) {
      const todayConfig = barbershopHours.find(
        (h) => h.dayOfWeek === dayOfWeek,
      );

      if (todayConfig) {
        isOpenDay = todayConfig.isOpen;
        startTime = todayConfig.startTime;
        endTime = todayConfig.endTime;
      } else {
        return { isOpen: false, hoursText: "" };
      }
    }

    if (!isOpenDay) {
      return { isOpen: false, hoursText: "" };
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const isOpenNow =
      currentMinutes >= startMinutes && currentMinutes < endMinutes;

    return {
      isOpen: isOpenNow,
      hoursText: `${startTime} - ${endTime}`,
    };
  };

  const status = getStatus();

  return (
    <Link
      href={`/barbershops/${barbershop.id}`}
      className="relative min-h-[200px] min-w-[290px] rounded-xl"
    >
      <div className="absolute top-0 left-0 z-10 h-full w-full rounded-lg bg-linear-to-t from-black to-transparent" />
      <Image
        src={barbershop.imageUrl}
        alt={barbershop.name}
        fill
        className="rounded-xl object-cover"
      />
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
        <StarIcon size={12} className="fill-[#ffff] text-white" />
        <span className="text-xs text-white">
          {averageRating} {totalReviews > 0 ? `(${totalReviews})` : ""}
        </span>
      </div>

      <div className="absolute right-0 bottom-0 left-0 z-20 p-4">
        <div className="mb-1 flex items-center gap-2 text-[10px]">
          <span
            className={`font-bold uppercase ${
              status.isOpen ? "text-emerald-400" : "text-rose-500"
            }`}
          >
            {status.isOpen ? "Aberto" : "Fechado"}
          </span>
          <span className="text-muted-foreground">{status.hoursText}</span>
        </div>
        <h3 className="text-foreground text-lg font-bold">{barbershop.name}</h3>
        <p className="text-foreground text-xs">{barbershop.address}</p>
      </div>
    </Link>
  );
}
