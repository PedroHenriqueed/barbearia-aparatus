"use client";

import { Button } from "@/app/_components/ui/button";
import { LogInIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function UnauthenticatedMessage() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-5 py-32 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center ">
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold text-white">Você não está logado</h2>
        <p className="mx-auto max-w-[280px] text-sm text-zinc-400">
          Faça login com sua conta do Google para acessar seus agendamentos e
          favoritos.
        </p>
      </div>

      <Button
        onClick={handleLogin}
        className="mt-4 gap-2 rounded-full px-6 font-bold"
      >
        <LogInIcon size={18} />
         Login
      </Button>
    </div>
  );
}
