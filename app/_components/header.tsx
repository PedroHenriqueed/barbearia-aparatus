"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";


const Header = () => {
  return (
    <header>
      <Card className="rounded-none border-none shadow-none">
        <CardContent className="flex flex-row items-center justify-between px-5">
          <Link href="/">
          <Image src="/trivo_logo.png" alt="FSW Barber" height={18} width={120} />
          </Link>

        </CardContent>
      </Card>
    </header>
  );
};

export default Header;
