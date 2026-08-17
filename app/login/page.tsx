"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<"welcome" | "login" | "signup">("welcome");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (view === "login") {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });

        if (error) {
          toast.error(error.message || "E-mail ou senha incorretos.");
        } else {
          toast.success("Login realizado com sucesso!");
          router.push("/");
        }
      } else {
        if (!name) {
          toast.error("Por favor, preencha o seu nome.");
          setIsLoading(false);
          return;
        }

        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });

        if (error) {
          toast.error(error.message || "Erro ao criar conta.");
        } else {
          toast.success("Conta criada com sucesso!");
          router.push("/");
        }
      }
    } catch {
      toast.error("Ocorreu um erro inesperado ao autenticar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-between overflow-hidden bg-black px-6 py-6 font-sans text-white">
      {/* IMAGEM DE FUNDO COM OVERLAY ESCURO */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/3a773e8613d46875310847caab4ec091.jpg"
          alt="Barbearia"
          fill
          className="object-cover opacity-70"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className="relative z-10 flex h-full w-full max-w-[360px] flex-col justify-between">
        {/* =========================================
            ETAPA 1: TELA INICIAL (ESTILO SPOTIFY)
           ========================================= */}
        {view === "welcome" && (
          <div className="flex h-full flex-col items-center justify-between pt-4 pb-14">
            <div className="h-4" />

            {/* LOGO E SUBTÍTULO CENTRALIZADOS */}
            <div className="my-auto flex flex-col items-center px-4 text-center">
              <div className="relative mb-3 h-19 w-44">
                <Image
                  src="/trivo_logo.png"
                  alt="Logo Trivo"
                  fill
                  className="object-contain brightness-0 invert"
                  priority
                />
              </div>
            </div>

            {/* ÁREA DOS BOTÕES (MENORES E MAIS ALTOS) */}
            <div className="m-20 flex w-full flex-col items-center gap-5">
              {/* BOTÃO PRINCIPAL (CRIAR CONTA) */}
              <button
                type="button"
                onClick={() => setView("signup")}
                className="flex h-12 w-[270px] items-center justify-center rounded-full bg-white text-[11px] font-bold tracking-wider text-black uppercase shadow-lg transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                CRIAR CONTA
              </button>

              {/* LINK SUTIL DEBAIXO DO BOTÃO */}
              <button
                type="button"
                onClick={() => setView("signup")}
                className="my-1 text-[10px] text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-white"
              >
                Criar uma nova conta
              </button>

              {/* BOTÃO SECUNDÁRIO (ENTRAR) */}
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex h-12 w-[270px] items-center justify-center rounded-full bg-[#242424] text-[11px] font-bold tracking-wider text-white uppercase transition-all hover:bg-[#2d2d2d] active:scale-[0.98]"
              >
                ENTRAR
              </button>
            </div>
          </div>
        )}

        {/* =========================================
            ETAPA 2: FORMULÁRIO (LOGIN / SIGNUP)
           ========================================= */}
        {view !== "welcome" && (
          <div className="flex h-full flex-col justify-between py-2">
            {/* BARRA SUPERIOR (VOLTAR E LOGO) */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setView("welcome")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/90 text-white backdrop-blur-md transition-all hover:bg-zinc-800"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="relative h-12 w-24">
                <Image
                  src="/trivo_logo.png"
                  alt="Logo"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>

              <div className="w-9" />
            </div>

            {/* FORMULÁRIO CENTRAL */}
            <div className="py- my-auto">
              <h1 className="mb-2 text-2xl font-black tracking-wide text-white uppercase">
                {view === "login" ? "Entrar" : "Criar Conta"}
              </h1>
              <p className="mb-5 text-xs text-zinc-400">
                {view === "login"
                  ? "Insira seus dados para acessar sua conta."
                  : "Preencha as informações para começar."}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {view === "signup" && (
                  <div className="relative">
                    <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={view === "signup"}
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pr-4 pl-11 text-xs text-white placeholder-zinc-500 transition-all outline-none focus:border-zinc-400"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pr-4 pl-11 text-xs text-white placeholder-zinc-500 transition-all outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pr-11 pl-11 text-xs text-white placeholder-zinc-500 transition-all outline-none focus:border-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-white text-xs font-bold tracking-wider text-black uppercase shadow-lg transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                  ) : view === "login" ? (
                    "ENTRAR"
                  ) : (
                    "CONFIRMAR CADASTRO"
                  )}
                </button>
              </form>

              <div className="relative my-7 flex items-center justify-center">
                <div className="w-full border-t border-zinc-800" />
                <span className="absolute bg-black px-3 text-[10px] font-medium text-zinc-500 uppercase">
                  Ou acesse com
                </span>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 transition-all hover:bg-zinc-800"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 transition-all hover:bg-zinc-800"
                >
                  <svg
                    className="h-4 w-4 fill-current text-white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.98 1.08.08 2.16-.58 2.81-1.38z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* TROCAR ENTRE LOGIN E SIGNUP */}
            <div className="text-center">
              {view === "login" ? (
                <p className="text-xs text-zinc-400">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setView("signup")}
                    className="font-bold text-white hover:underline"
                  >
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p className="text-xs text-zinc-400">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="font-bold text-white hover:underline"
                  >
                    Faça login
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
