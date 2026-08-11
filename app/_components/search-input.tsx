"use client";

import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; 

interface SearchInputProps {
  defaultSearch?: string;
}

export default function SearchInput({ defaultSearch = "" }: SearchInputProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);

  useEffect(() => {
    setSearch(defaultSearch);
  }, [defaultSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/barbershops?search=${search}`);
  };

return (
  <form onSubmit={handleSearch} className="relative w-full">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
    <Input
      type="text"
      placeholder="Buscar"
      className="border-border rounded-lg h-12 pl-10" 
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </form>
);
}
