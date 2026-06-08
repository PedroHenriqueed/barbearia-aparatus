import Link from "next/link"
import Image from "next/image"

const quickSearchOptions = [
  { title: "Cabelo", localImage: "/cabelo.png" },
  { title: "Barba", localImage: "/barba.png" },
  { title: "Acabamento", localImage: "/acabamento.png" },
  { title: "Sobrancelha", localImage: "/sobrancelha.png" },
  { title: "Massagem", localImage: "/massagem.png" },
  { title: "Hidratação", localImage: "/hidratacao.png" },
]

export const QuickSearchButtons = () => {
  return (
    <div className="flex gap-5 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden">
      {quickSearchOptions.map((option) => (
        <Link
          key={option.title}
          href={`/barbershops?search=${option.title}`}
          className="flex shrink-0 flex-col items-center gap-2 group"
        >
          <div
            className="
              flex h-14 w-14 items-center justify-center
              rounded-xl border-2 border-border
              transition-all duration-300
              group-hover:scale-105
              group-hover:border-primary
            "
          >
            <Image
              src={option.localImage}
              width={50}
              height={50}
              alt={`${option.title} icon`}
            />
          </div>

          <span className="w-16 text-center text-xs font-bold text-muted-foreground transition-colors duration-300 group-hover:text-primary">
            {option.title}
          </span>
        </Link>
      ))}
    </div>
  )
}
