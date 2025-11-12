import Header from './_components/header'; 
import SearchInput from './_components/search-input';
import Image from 'next/image';
import banner from '../public/banner.png';
import BookingItem from './_components/booking-item';
import { prisma } from '@/lib/prisma';
import BarbershopItem from './_components/barbershop-item';

const Home = async() => {
  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: 'asc'
    },
  });
  const popularBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: 'desc'
    },
  });
  return (
    <main>
      <Header/>
      <div className="p-5 space-y-4">
      <SearchInput/>
      <Image src={banner} alt="Agende agora" sizes="100vw" className='h-auto w- w-full' />
      <h2 className='text-xs text-foreground font-semibold uppercase'>
        Agendamentos
      </h2>
      <BookingItem
      serivceName="Corte de Cabelo" 
      barbeshopName="Barbearia do Zé"
      barbershopImageUrl="https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png"
      date={new Date()}     
      />
      <h2 className='text-xs text-foreground font-semibold uppercase'>
        Recomendados
       </h2>
      <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {recommendedBarbershops.map((barbershop) => (
        <BarbershopItem key={barbershop.id} barbershop={barbershop}/>
      ))}
      </div>    
      <h2 className='text-xs text-foreground font-semibold uppercase'>
        Populares
       </h2>  
       <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {popularBarbershops.map((barbershop) => (
        <BarbershopItem key={barbershop.id} barbershop={barbershop}/>
      ))}
      </div> 
    </div>
  </main>
  );
};
export default Home;