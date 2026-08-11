
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
        cursor-pointer
        transition-all duration-300
        group-hover:scale-[1.02] group-hover:brightness-110 group-hover:shadow-lg 
      ">


        <Image
          src={image}
          alt={title}
          fill
          className="drop-shadow-lg transition-transform duration-300 group-hover:scale-110 object-cover overflow-hidden"
        />

        <div className="absolute inset-0 bg-black/60 transition-colors group-hover:bg-black/50">

          <span className="
          absolute top-3 left-3 z-10
          text-white text-sm font-semibold leading-tight
        ">
            {title}
          </span>


        </div>
      </div>
    </Link>
  )
}
