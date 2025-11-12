import Header from './_components/header'; 
import SearchInput from './_components/search-input';
import Image from 'next/image';
import banner from '../public/banner.png';
import BookingItem from './_components/booking-item';
import { prisma } from '@/lib/prisma';
import BarbershopItem from './_components/barbershop-item';
import Footer from './_components/ui/footer';
import { PageContainer, PageSectionTitle, PageSection, PageScrollContainer } from './_components/ui/page';

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
      <PageContainer>
      <SearchInput/>
      <Image src={banner} alt="Agende agora" sizes="100vw" className='h-auto w- w-full' 
      />
      <PageSection>
      <PageSectionTitle>Agendamentos</PageSectionTitle>
      <BookingItem
      serivceName="Corte de Cabelo" 
      barbeshopName="Barbearia do Zé"
      barbershopImageUrl="https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png"
      date={new Date()}     
      />
      </PageSection>

      <PageSection>
      <PageSectionTitle>
        Recomendados
      </PageSectionTitle>
      <PageScrollContainer>  
      {recommendedBarbershops.map((barbershop) => (
        <BarbershopItem key={barbershop.id} barbershop={barbershop}
        />
      ))}
      </PageScrollContainer>      
      </PageSection> 

      <PageSection>
      <PageSectionTitle>Populares</PageSectionTitle> 
      <PageScrollContainer>
      {popularBarbershops.map((barbershop) => (
        <BarbershopItem key={barbershop.id} barbershop={barbershop}
        />
      ))}
      </PageScrollContainer>    
      </PageSection>
    </PageContainer>    
    <Footer/>
  </main>
  );
};
export default Home;