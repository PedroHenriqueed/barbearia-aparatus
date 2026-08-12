import Image from "next/image";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  image: string;
  href?: string;
}

export function ServiceCard({ title, image, href = "#" }: ServiceCardProps) {
  return (
    <div className="h-20 w-full rounded-xl shadow-lg shadow-black/50 [-webkit-transform:translateZ(0)]">
      <Link href={href} className="group block h-full w-full">
        <div className="relative h-full w-full cursor-pointer overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-110">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/60 transition-colors group-hover:bg-black/50">
            <span className="absolute top-3 left-3 z-10 text-sm leading-tight font-semibold text-white">
              {title}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
