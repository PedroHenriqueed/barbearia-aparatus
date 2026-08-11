import Link from "next/link";
import { Barbershop } from "@prisma/client";
import Image from "next/image";
import {StarIcon} from "lucide-react"

interface BarbershopItemProps {
    barbershop: Barbershop
}
const BarbershopItem = ({barbershop}: BarbershopItemProps) => {
    // 1. Pega a hora atual do sistema (retorna um número de 0 a 23)
  const currentHour = new Date().getHours();
  
  // 2. Verifica se a hora atual está entre 8h (inclusivo) e 18h (exclusivo, ou seja, 17:59)
  const isOpen = currentHour >= 8 && currentHour < 18;
  return (
      <Link href ={`/barbershops/${barbershop.id}`}
      className="relative rounded-xl min-h-[200px] min-w-[290px]">
    <div className="bg-linear-to-t from-black to-transparent h-full w-full absolute top-0 left-0 z-10 rounded-lg" />
    <Image 
    src= {barbershop.imageUrl} 
    alt={barbershop.name} fill 
    className="object-cover rounded-xl"
    />
    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
            <StarIcon size={12} className="fill-[#ffff] text-white" />
            <span className="text-xs text-white">4.9 (179)</span>
          </div>


    <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
<div className="mb-1 flex items-center gap-2 text-[10px]">
          <span className="font-bold uppercase text-muted-foreground">
            {isOpen ? 'Aberto' : 'Fechado'}
          </span>
          <span className="text-muted-foreground">8:00 - 18:00</span>
        </div>
    <h3 className="text-foreground text-lg font-bold">{barbershop.name}</h3>
    <p className="text-foreground text-xs">{barbershop.address}</p>
  </div>

  </Link>
  );
};

export default BarbershopItem;