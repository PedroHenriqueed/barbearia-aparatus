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

export default function QuickSearchOptions() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {quickSearchOptions.map((option) => (
        <Link
          key={option.title}
          href={`/barbershops?service=${option.title}`}
          className="relative flex h-[80px] w-full items-center overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 transition-all active:scale-95"
        >
          {/* Imagem de Fundo */}
          <Image
            src={option.imageUrl}
            alt={option.title}
            fill
            className="object-cover"
          />

          {/* OVERLAY ESCURO COM GRADIENTE (Resolve a falta de sombra/contraste) */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

          {/* Texto do Serviço */}
          <span className="relative z-20 pl-4 text-sm font-bold tracking-wide text-white">
            {option.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
