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
          className="relative block h-20 w-full rounded-2xl [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.5))] transition-transform active:scale-95"
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              src={option.imageUrl}
              alt={option.title}
              fill
              className="object-cover opacity-40 brightness-75"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <span className="relative z-10 flex h-full items-center pl-4 text-sm font-bold tracking-wide text-white">
              {option.title}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
