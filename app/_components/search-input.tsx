"use client";

import { SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchInputProps {
  defaultSearch?: string;
}

export default function SearchInput({ defaultSearch = "" }: SearchInputProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    // Redireciona o usuário para a página de barbearias com o termo de busca
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
