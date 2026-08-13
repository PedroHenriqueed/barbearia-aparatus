import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    // h-10 fixa a altura do header para não empurrar nada para baixo
    <header className="flex h-10 w-full items-center justify-between bg-transparent">
      <Link href="/" className="flex items-center">
        <Image
          src="/trivo_logo.png"
          alt="Trivo"
          height={20}
          width={90}
          className=" invert h-8 w-auto object-contain"
        />
      </Link>


    </header>
  );
}
