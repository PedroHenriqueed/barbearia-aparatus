"use client";

import { useState } from "react";
import { Share, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";

interface ShareDialogProps {
  barbershopName: string;
  slug?: string | null;
}

export function ShareDialog({ barbershopName, slug  }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

const getShareUrl = () => {
  if (typeof window !== "undefined") {
    if (slug) {
      // Monta o link amigável: https://seusite.com/nome-da-barbearia
      return `${window.location.origin}/${slug}`;
    }
    // Fallback para o ID longo caso a barbearia não tenha slug
    return window.location.href;
  }
  return "";
};
  const handleCopy = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      `Agende seu horário na ${barbershopName}! \n${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full text-white transition-all hover:bg-white/10"
        >
          <Share className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-lg font-bold">
            Compartilhar Barbearia
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Envie o link da {barbershopName} para seus amigos realizarem
            agendamentos.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          {/* Botão direto de WhatsApp */}
          <Button
            onClick={handleWhatsAppShare}
            className="h-11 w-full gap-2 rounded-xl bg-white font-semibold text-black hover:bg-[#ffffff]/70"
          >
            <MessageCircle className="h-5 w-5" />
            Enviar pelo WhatsApp
          </Button>

          {/* Campo com Link e Copiar */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-400">
              Ou copie o link direto:
            </span>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={getShareUrl()}
                className="h-10 border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus-visible:ring-0"
              />
              <Button
                onClick={handleCopy}
                className={`h-10 shrink-0 gap-1.5 rounded-xl px-3 text-xs font-semibold text-white transition-all ${
                  copied
                    ? "bg-white text-black hover:bg-[#ffffff]/70"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
