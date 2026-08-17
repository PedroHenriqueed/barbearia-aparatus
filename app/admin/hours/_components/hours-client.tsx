"use client";

import { useState } from "react";
import { Save, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateOpeningHours } from "@/app/admin/actions";

interface OpeningHour {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function HoursClient({
  barbershopId,
  initialHours,
}: {
  barbershopId: string;
  initialHours: OpeningHour[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  const defaultHours: OpeningHour[] = Array.from({ length: 7 }).map((_, i) => ({
    dayOfWeek: i,
    isOpen: i !== 0,
    startTime: "09:00",
    endTime: "19:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
  }));

  const [hours, setHours] = useState<OpeningHour[]>(
    initialHours?.length ? initialHours : defaultHours,
  );

  const handleHourChange = (
    dayIndex: number,
    field: keyof OpeningHour,
    value: string | boolean,
  ) => {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayIndex ? { ...h, [field]: value } : h,
      ),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateOpeningHours(barbershopId, hours);
      toast.success("Horários atualizados com sucesso!");
    } catch {
      toast.error("Erro ao salvar horários.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-wider text-white uppercase">
          Grade de Horários
        </h1>
        <p className="text-xs text-zinc-400">
          Configure os dias e horários de funcionamento da barbearia.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-3">
          {hours.map((hour, index) => (
            <div
              key={hour.dayOfWeek}
              className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all ${
                hour.isOpen
                  ? "border-zinc-700 bg-zinc-900/80"
                  : "border-zinc-800 bg-zinc-900/30 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <Clock
                    size={16}
                    className={hour.isOpen ? "text-white" : "text-zinc-500"}
                  />
                  {DAYS_OF_WEEK[index]}
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={hour.isOpen}
                    onChange={(e) =>
                      handleHourChange(
                        hour.dayOfWeek,
                        "isOpen",
                        e.target.checked,
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-zinc-800 peer-checked:bg-white peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-600 after:bg-zinc-400 after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-black peer-checked:after:bg-black"></div>
                  <span className="ml-3 w-16 text-[11px] font-bold text-zinc-400 uppercase">
                    {hour.isOpen ? "Aberto" : "Fechado"}
                  </span>
                </label>
              </div>

              {hour.isOpen && (
                <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-3 md:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      Abertura
                    </span>
                    <input
                      type="time"
                      value={hour.startTime}
                      onChange={(e) =>
                        handleHourChange(
                          hour.dayOfWeek,
                          "startTime",
                          e.target.value,
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-white [color-scheme:dark] outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      Fechamento
                    </span>
                    <input
                      type="time"
                      value={hour.endTime}
                      onChange={(e) =>
                        handleHourChange(
                          hour.dayOfWeek,
                          "endTime",
                          e.target.value,
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-white [color-scheme:dark] outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      Início Almoço
                    </span>
                    <input
                      type="time"
                      value={hour.lunchStart}
                      onChange={(e) =>
                        handleHourChange(
                          hour.dayOfWeek,
                          "lunchStart",
                          e.target.value,
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-white [color-scheme:dark] outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      Fim Almoço
                    </span>
                    <input
                      type="time"
                      value={hour.lunchEnd}
                      onChange={(e) =>
                        handleHourChange(
                          hour.dayOfWeek,
                          "lunchEnd",
                          e.target.value,
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-white [color-scheme:dark] outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-xs font-bold tracking-wider text-black uppercase transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Salvar Horários
        </button>
      </form>
    </div>
  );
}
