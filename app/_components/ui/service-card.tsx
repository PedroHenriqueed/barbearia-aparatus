
import Image from "next/image"
import Link from "next/link"

interface ServiceCardProps {
  title: string
  image: string
  href?: string
}

export function ServiceCard({ title, image, href = "#" }: ServiceCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="
        relative w-full h-20 rounded-xl overflow-hidden
        bg-[#1546A1] cursor-pointer
        transition-all duration-300
        group-hover:scale-[1.02] group-hover:brightness-110 group-hover:shadow-lg
      ">

        {/* Texto no topo esquerdo */}
        <span className="
          absolute top-3 left-3 z-10
          text-white text-sm font-semibold leading-tight
        ">
          {title}
        </span>

        {/* Ícone no canto inferior direito */}
        <div className="absolute bottom-0 right-1 flex items-end justify-end">
          <Image
            src={image}
            alt={title}
            width={75}
            height={75}
            className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          />
        </div>

      </div>
    </Link>
  )
}
