"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import SidebarSheet from "./sidebar-sheet";

const Header = () => {
  return (
    <header>
      <Card className="rounded-none border-none shadow-none">
        <CardContent className="flex flex-row items-center justify-between px-5">
          <Link href="/">
          <Image src="/Logo.svg" alt="FSW Barber" height={18} width={120} />
          </Link>

          <SidebarSheet>
            <Button variant="outline" size="icon">
              <MenuIcon size={18} />
            </Button>
          </SidebarSheet>
        </CardContent>
      </Card>
    </header>
  );
};

export default Header;
