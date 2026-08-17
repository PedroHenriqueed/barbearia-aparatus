"use client";

import { useState, useEffect, useRef } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ZoomIn, ZoomOut, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/app/_components/ui/alert-dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { updateUserProfile } from "@/app/_actions/edit_user";

interface EditProfileDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    phone?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [phone, setPhone] = useState(user.phone || "");

  // Estados para o Modal de Crop / Preview de foto
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Controle de arrastar
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Refs para controle de arraste (Drag & Drop)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(user.name || "");
      setImage(user.image || "");
      setPhone(user.phone || "");
    }
  }, [open, user]);

  const { executeAsync, isPending } = useAction(updateUserProfile, {
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      onOpenChange(false);
      window.location.reload();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar perfil.");
    },
  });

  // Abre o leitor de arquivos e dispara a modal de preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setZoom(1);
        setOffset({ x: 0, y: 0 }); // Reseta posição ao trocar foto
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setImage("");
  };

  // Funções de Arrastar (Mouse e Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Recorta a imagem aplicando escala e deslocamento (X, Y)
  const handleConfirmCrop = () => {
    if (!tempImageSrc) return;

    const img = new Image();
    img.src = tempImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const OUTPUT_SIZE = 300; // Tamanho final da imagem salva
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Dimensões da tela de preview no CSS (h-64 w-64 = 256px)
        const CONTAINER_SIZE = 256;
        // Tamanho da máscara circular (h-48 w-48 = 192px)
        const CROP_SIZE = 192;

        // Calcula proporção entre imagem natural e container
        const baseScale = Math.min(
          CONTAINER_SIZE / img.width,
          CONTAINER_SIZE / img.height,
        );
        const totalScale = baseScale * zoom;

        // Converte as coordenadas do deslocamento de volta para o tamanho original
        const centerX = img.width / 2 - offset.x / totalScale;
        const centerY = img.height / 2 - offset.y / totalScale;

        const cropNaturalSize = CROP_SIZE / totalScale;

        const sx = centerX - cropNaturalSize / 2;
        const sy = centerY - cropNaturalSize / 2;

        ctx.drawImage(
          img,
          sx,
          sy,
          cropNaturalSize,
          cropNaturalSize,
          0,
          0,
          OUTPUT_SIZE,
          OUTPUT_SIZE,
        );

        const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
        setImage(croppedBase64);
        setIsCropModalOpen(false);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeAsync({ name, image, phone });
  };

  return (
    <>
      {/* Modal Principal de Edição de Perfil */}
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="z-[9999] w-[90%] max-w-[420px] rounded-2xl border-zinc-800 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg font-bold">
              Editar Perfil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-zinc-400">
              Atualize seus dados cadastrais abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-2 border-zinc-800 shadow-lg">
                <AvatarImage src={image} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold">
                  {name[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-3 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:underline"
                >
                  Editar foto
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded px-2 py-0.5 text-red-500 hover:underline"
                >
                  Remover
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Nome
              </label>
              <Input
                type="text"
                required
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-zinc-800 bg-zinc-900 text-sm text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Telefone / WhatsApp
              </label>
              <Input
                type="text"
                placeholder="(00) 90000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-zinc-800 bg-zinc-900 text-sm text-white"
              />
            </div>

            <p className="text-[11px] text-zinc-500">
              * O e-mail e a autenticação continuam vinculados à sua conta do
              Google.
            </p>

            <AlertDialogFooter className="mt-2 flex flex-row gap-2">
              <AlertDialogCancel
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-0 h-11 flex-1 rounded-xl border-zinc-800 bg-transparent text-white hover:bg-zinc-900"
              >
                Cancelar
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 flex-1 rounded-xl bg-zinc-600 font-bold text-white hover:bg-zinc-700"
              >
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Secundário de Preview e Ajuste da Foto */}
      {isCropModalOpen && tempImageSrc && (
        <AlertDialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
          <AlertDialogContent className="z-[10000] flex max-w-[420px] flex-col items-center gap-5 rounded-3xl border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
            <AlertDialogHeader className="relative w-full flex-row items-center justify-center">
              <AlertDialogTitle className="text-base font-semibold text-zinc-300">
                Ajustar Foto
              </AlertDialogTitle>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="absolute top-0 right-0 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </AlertDialogHeader>

            {/* Container da Imagem com Controle de Arrastar */}
            <div
              className="relative flex h-64 w-64 cursor-move touch-none items-center justify-center overflow-hidden rounded-2xl bg-black"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                src={tempImageSrc}
                alt="Preview"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  willChange: "transform",
                }}
                className="pointer-events-none max-h-full max-w-full object-contain select-none"
                draggable={false}
              />
              {/* Máscara vazada circular */}
              <div className="pointer-events-none absolute h-48 w-48 rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" />
            </div>

            {/* Controle de Zoom */}
            <div className="flex w-full items-center justify-center gap-3 px-2">
              <ZoomOut size={18} className="text-zinc-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-white"
              />
              <ZoomIn size={18} className="text-zinc-400" />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-blue-500 hover:underline"
            >
              Selecionar outra foto
            </button>

            <Button
              type="button"
              onClick={handleConfirmCrop}
              className="h-12 w-full rounded-full bg-white text-base font-bold text-black hover:bg-zinc-200"
            >
              Confirmar
            </Button>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
