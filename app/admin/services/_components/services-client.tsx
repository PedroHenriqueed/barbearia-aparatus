"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createService,
  updateService,
  deleteService,
} from "@/app/admin/actions";

export default function ServicesClient({ barbershopId, initialServices }: any) {
  const [services, setServices] = useState<any[]>(initialServices || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const handleOpenModal = (service?: any) => {
    if (service) {
      setEditingService(service);
      setForm({
        name: service.name,
        description: service.description,
        price: (service.priceInCents / 100).toString(),
        imageUrl: service.imageUrl,
      });
    } else {
      setEditingService(null);
      setForm({ name: "", description: "", price: "", imageUrl: "" });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024)
        return toast.error("A imagem deve ter no máximo 2MB.");
      const reader = new FileReader();
      reader.onloadend = () =>
        setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbershopId)
      return toast.error("Crie a barbearia primeiro em Perfil.");
    setIsLoading(true);
    const priceInCents = Math.round(
      parseFloat(form.price.replace(",", ".")) * 100,
    );
    const defaultImg =
      "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png";

    try {
      if (editingService) {
        const updated = await updateService({
          id: editingService.id,
          name: form.name,
          description: form.description,
          priceInCents,
          imageUrl: form.imageUrl || defaultImg,
        });
        setServices(
          services.map((s) => (s.id === editingService.id ? updated : s)),
        );
        toast.success("Serviço atualizado!");
      } else {
        const created = await createService({
          barbershopId,
          name: form.name,
          description: form.description,
          priceInCents,
          imageUrl: form.imageUrl || defaultImg,
        });
        setServices([...services, created]);
        toast.success("Serviço criado!");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir serviço?")) return;
    await deleteService(id);
    setServices(services.filter((s) => s.id !== id));
    toast.success("Removido!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase">
            Serviços
          </h1>
          <p className="text-xs text-zinc-400">
            Gerencie os cortes e preços do seu catálogo.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"
        >
          <Plus size={15} /> Adicionar
        </button>
      </div>

      <div className="grid gap-3">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-xs text-zinc-500">
            Nenhum serviço cadastrado.
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-zinc-800 bg-black">
                  <Image
                    src={
                      service.imageUrl ||
                      "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png"
                    }
                    alt={service.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {service.name}
                  </h3>
                  <span className="text-xs font-black text-zinc-200">
                    R${" "}
                    {(service.priceInCents / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(service)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-rose-400 hover:bg-rose-950/50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-bold tracking-wider uppercase">
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-xs text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  Preço (R$)
                </label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-xs text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  Foto do Serviço
                </label>
                <label className="group relative flex h-24 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-600">
                  {form.imageUrl && (
                    <Image
                      src={form.imageUrl}
                      alt="Prévia"
                      fill
                      unoptimized
                      className="object-cover opacity-60"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Camera size={18} className="text-zinc-300" />
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {form.imageUrl ? "Alterar foto" : "Escolher arquivo"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-xs text-white outline-none focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-white text-xs font-bold tracking-wider text-black uppercase transition-all hover:bg-zinc-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Salvar Serviço"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
