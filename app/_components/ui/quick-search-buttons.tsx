"use client";

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
          className="relative flex h-16 w-full items-center overflow-hidden rounded-xl border border-zinc-800 bg-cover bg-center transition-all active:scale-95"
          style={{ backgroundImage: `url(${option.imageUrl})` }}
        >
          {/* OVERLAY ESCURO (Aplica o escurecimento e gradiente sem vazar) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />

          {/* TEXTO DO SERVIÇO */}
          <span className="relative z-10 pl-4 text-sm font-bold tracking-wide text-white">
            {option.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
