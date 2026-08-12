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
    <div className="grid grid-cols-2 gap-2.5 px-5">
      {quickSearchOptions.map((option) => (
        <Link
          key={option.title}
          href={`/barbershops?service=${option.title}`}
          /* h-16 deixa o card um pouco mais compacto (64px) */
          className="relative flex h-16 w-full transform-gpu items-center overflow-hidden rounded-xl border border-zinc-800 bg-black transition-all active:scale-95"
          style={{
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
          }}
        >
          {/* Imagem com opacidade reduzida (opacity-50) */}
          <Image
            src={option.imageUrl}
            alt={option.title}
            fill
            className="rounded-xl object-cover opacity-50"
          />

          {/* OVERLAY REFORÇADO (Sombreamento muito mais escuro e denso) */}
          <div className="absolute inset-0 z-10 rounded-xl bg-gradient-to-r from-black/95 via-black/80 to-black/40" />

          {/* Texto do serviço */}
          <span className="relative z-20 pl-3.5 text-sm font-bold tracking-wide text-white">
            {option.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
