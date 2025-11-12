import { Barbershop } from "../generated/prisma/client";
import Image from "next/image";

interface BarbershopItemProps {
    barbershop: Barbershop
}


const BarbershopItem = ({barbershop}: BarbershopItemProps) => {
  return (
    
    <div className="relative rounded-xl min-h-[200px] min-w-[290px]">
    <div className="bg-linear-to-t from-black to-transparent h-full w-full absolute top-0 left-0 z-10 rounded-lg" />
    <Image 
    src= {barbershop.imageUrl} 
    alt={barbershop.name} fill 
    className="object-cover rounded-xl"
    />
    <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
    <h3 className="text-background text-lg font-bold">{barbershop.name}</h3>
    <p className="text-background text-xs">{barbershop.address}</p>
  </div>
  </div>
  );
}   
export default BarbershopItem;