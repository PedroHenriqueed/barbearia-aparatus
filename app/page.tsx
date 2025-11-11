import Header from './_components/header'; 
import SearchInput from './_components/search-input';
import Image from 'next/image';
import banner from '../public/banner.png';

const Home = () => {
  return (
    <div>
      <Header/>
      <div className="px-5 space-y-4">
      <SearchInput/>
      <Image src={banner} alt="Agende agora" sizes="100vw" className='h-auto w- w-full' />
    </div>
    </div>
  );
}
export default Home;