"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";

const Header = () => {
  return (
    <header>

      <Card className="rounded-none border-none shadow-none bg-transparent">
        <CardContent className="flex flex-row items-center justify-between px-2 pt-5">
          <Link href="/">
            <Image src="/trivo_logo.png" alt="FSW Barber" className="invert" height={80} width={110} />
          </Link>
        </CardContent>
      </Card>
    </header>
  );
};

export default Header;