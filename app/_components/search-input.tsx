"use client";

import { SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // 1. Importe o useEffect

interface SearchInputProps {
  defaultSearch?: string;
}

export default function SearchInput({ defaultSearch = "" }: SearchInputProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);

  // 2. Adicione este 'vigia' (useEffect)
  // Toda vez que o usuário clicar num link rápido e a URL mudar,
  // o defaultSearch muda, e isso atualiza o texto do input automaticamente!
  useEffect(() => {
    setSearch(defaultSearch);
  }, [defaultSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/barbershops?search=${search}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Pesquise serviços ou barbearias"
        className="border-border rounded-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button
        type="submit"
        variant="default"
        size="icon"
        className="rounded-full"
      >
        <SearchIcon />
      </Button>
    </form>
  );
}
