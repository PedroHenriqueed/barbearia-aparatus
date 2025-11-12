import Header from './_components/header'; 
import SearchInput from './_components/search-input';
import Image from 'next/image';
import banner from '../public/banner.png';
import BookingItem from './_components/booking-item';

const Home = () => {
  return (
    <main>
      <Header/>
      <div className="px-5 space-y-4">
      <SearchInput/>
      <Image src={banner} alt="Agende agora" sizes="100vw" className='h-auto w- w-full' />
      <h2 className='text-xs text-foreground font-semibold uppercase'>Agendamentos</h2>
      <BookingItem
      serivceName="Corte de Cabelo" barbeshopName="Barbearia do Zé" barbershopImageUrl="https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png"
      date={new Date()}     
      />
      </div>
    </main>
  );
}
export default Home;