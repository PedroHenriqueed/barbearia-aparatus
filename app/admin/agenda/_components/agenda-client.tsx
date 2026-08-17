"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Phone, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cancelBookingByBarber } from "@/app/admin/actions";

interface BookingItem {
  id: string;
  date: string;
  serviceName: string;
  priceInCents: number;
  clientName: string;
  clientPhone: string;
  cancelled: boolean;
}

export default function AgendaClient({
  bookings,
}: {
  bookings: BookingItem[];
}) {
  const handleCancel = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    try {
      await cancelBookingByBarber(id);
      toast.success("Agendamento cancelado!");
    } catch {
      toast.error("Erro ao cancelar agendamento.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-wider text-white uppercase">
          Agenda do Dia
        </h1>
        <p className="text-sm text-zinc-400 capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="grid gap-3">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center text-xs text-zinc-500">
            Nenhum agendamento para hoje.
          </div>
        ) : (
          bookings.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${
                item.cancelled
                  ? "border-rose-900/30 bg-rose-950/10 opacity-60"
                  : "border-zinc-800 bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-800 px-3.5 py-2 text-white">
                  <Clock size={14} className="text-zinc-400" />
                  <span className="mt-1 text-sm font-black">
                    {format(new Date(item.date), "HH:mm")}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {item.clientName}
                  </h3>
                  <p className="text-xs text-zinc-400">{item.serviceName}</p>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
                    <Phone size={11} /> {item.clientPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-zinc-800/80 pt-3 md:border-t-0 md:pt-0">
                <span className="text-sm font-black text-white">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.priceInCents / 100)}
                </span>

                {item.cancelled ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                    <XCircle size={14} /> Cancelado
                  </span>
                ) : (
                  <button
                    onClick={() => handleCancel(item.id)}
                    className="flex items-center gap-1 rounded-xl border border-rose-800/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                  >
                    <XCircle size={14} /> Cancelar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
