"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { createBarbershopRating } from "@/app/_actions/create-review";

interface ReviewDialogProps {
  barbershopId: string;
  bookingId?: string;
}

export default function ReviewDialog({
  barbershopId,
  bookingId,
}: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { executeAsync, isPending } = useAction(createBarbershopRating, {
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      setOpen(false);
      setComment("");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao enviar avaliação.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeAsync({ barbershopId, bookingId, rating, comment });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-border text-foreground hover:bg-secondary h-12 w-full flex-1 rounded-xl text-base font-bold"
        >
          Avaliar Atendimento
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">
            Deixe sua Avaliação
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4 py-2"
        >
          {/* Seletor Interativo de Estrelas */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <StarIcon
                  size={28}
                  className={`${
                    star <= (hoverRating || rating)
                      ? "fill-white text-zinc-400"
                      : "text-zinc-600"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Campo de Comentário com HTML nativo */}
          <textarea
            placeholder="Conte como foi sua experiência (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-white font-bold text-zinc-950 hover:bg-zinc-400"
          >
            {isPending ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
