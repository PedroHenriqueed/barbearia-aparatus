"use client";

import Image from "next/image";
import Link from "next/link";

interface QuickSearchOption {
  title: string;
  imageUrl: string;
}

const quickSearchOptions: QuickSearchOption[] = [
  { title: "Cabelo", imageUrl: "/cabelo.png" },
  { title: "Barba", imageUrl: "/barba.png" },
  { title: "Acabamento", imageUrl: "/acabamento.png" },
  { title: "Sobrancelha", imageUrl: "/sobrancelha.png" },
  { title: "Massagem", imageUrl: "/massagem.png" },
  { title: "Hidratação", imageUrl: "/hidratacao.png" },
];

export default function QuickSearchButtons() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {quickSearchOptions.map((option) => (
        <Link
          key={option.title}
          href={`/barbershops?service=${option.title}`}
          className="relative flex h-20 w-full items-center overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 transition-all active:scale-95"
        >
          {/* Imagem base com tom escuro reduzido */}
          <Image
            src={option.imageUrl}
            alt={option.title}
            fill
            className="object-cover opacity-40 brightness-75"
          />

          {/* OVERLAY ESCURO TOTAL (Uniformiza 100% dos cantos e bordas) */}
          <div className="absolute inset-0 bg-black/50" />

          {/* GRADIENTE PARA LEITURA DO TEXTO */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Texto do serviço */}
          <span className="relative z-10 pl-4 text-sm font-bold tracking-wide text-white">
            {option.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
