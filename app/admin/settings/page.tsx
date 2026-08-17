"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateBarbershop } from "@/app/admin/actions";

export default function SettingsClient({ initialData }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [barbershop, setBarbershop] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    imageUrl:
      initialData?.imageUrl ||
      "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
    description: initialData?.description || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Máximo 2MB.");
      const reader = new FileReader();
      reader.onloadend = () =>
        setBarbershop({ ...barbershop, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updated = await updateBarbershop({
        ...barbershop,
        phones: barbershop.phone ? [barbershop.phone] : [],
      });
      if (updated?.id) setBarbershop((prev) => ({ ...prev, id: updated.id }));
      toast.success("Barbearia atualizada!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-wider text-white uppercase">
          Perfil da Barbearia
        </h1>
        <p className="text-xs text-zinc-400">
          Gerencie as informações principais do seu negócio.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
      >
        <label className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 transition-all hover:border-zinc-500">
          <Image
            src={barbershop.imageUrl}
            alt="Capa"
            fill
            unoptimized
            className="object-cover opacity-50 group-hover:opacity-40"
          />
          <div className="absolute z-10 flex flex-col items-center gap-2">
            <div className="rounded-full bg-black/60 p-3 backdrop-blur-md transition-transform group-hover:scale-110">
              <Camera size={24} className="text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-wider text-white uppercase shadow-black drop-shadow-md">
              Alterar Foto
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-zinc-400 uppercase">
            Nome
          </label>
          <input
            type="text"
            value={barbershop.name}
            onChange={(e) =>
              setBarbershop({ ...barbershop, name: e.target.value })
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-xs text-white outline-none focus:border-zinc-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-zinc-400 uppercase">
            Endereço
          </label>
          <input
            type="text"
            value={barbershop.address}
            onChange={(e) =>
              setBarbershop({ ...barbershop, address: e.target.value })
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-xs text-white outline-none focus:border-zinc-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-zinc-400 uppercase">
            Telefone / WhatsApp
          </label>
          <input
            type="text"
            value={barbershop.phone}
            onChange={(e) =>
              setBarbershop({ ...barbershop, phone: e.target.value })
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-xs text-white outline-none focus:border-zinc-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-xs font-bold text-black uppercase transition-all hover:bg-zinc-200 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}{" "}
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
