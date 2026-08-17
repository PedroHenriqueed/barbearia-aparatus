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
  const [targetPath, setTargetPath] = useState("/");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOpenLogin = (path: string, mode: "login" | "signup") => {
    setTargetPath(path);
    setView(mode);
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: targetPath,
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
          callbackURL: targetPath,
        });

        if (error) {
          toast.error(error.message || "E-mail ou senha incorretos.");
        } else {
          toast.success("Login realizado com sucesso!");
          router.push(targetPath);
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
          callbackURL: targetPath,
        });

        if (error) {
          toast.error(error.message || "Erro ao criar conta.");
        } else {
          toast.success("Conta criada com sucesso!");
          router.push(targetPath);
        }
      }
    } catch {
      toast.error("Ocorreu um erro inesperado ao autenticar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex flex-col overflow-hidden bg-black font-sans text-zinc-900">
      {/* =========================================
          CABEÇALHO SUPERIOR (OCUPA TODO O ESPAÇO RESTANTE)
         ========================================= */}
      <div
        className={`relative flex w-full items-center justify-center bg-black transition-all duration-500 ease-in-out ${
          view === "welcome"
            ? "flex-1 p-6 pb-12"
            : "h-[16vh] min-h-[120px] p-6 pb-8"
        }`}
      >
        {/* IMAGEM DE FUNDO - TRANSIÇÃO SUAVE */}
        <div
          className={`absolute inset-0 z-0 transition-all duration-500 ease-in-out ${
            view === "welcome"
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-105 opacity-0"
          }`}
        >
          <Image
            src="/3a773e8613d46875310847caab4ec091.jpg"
            alt="Barbearia"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* LOGO DA TRIVO E BOTÃO VOLTAR */}
        {view !== "welcome" && (
          <>
            <button
              type="button"
              onClick={() => setView("welcome")}
              className="absolute top-6 left-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all hover:bg-zinc-200 active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="relative z-10 h-10 w-32">
              <Image
                src="/trivo_logo.png"
                alt="Logo Trivo"
                fill
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          </>
        )}
      </div>

      {/* =========================================
          CARTÃO INFERIOR BRANCO
         ========================================= */}
      <div
        className={`relative z-20 -mt-8 w-full rounded-t-[36px] bg-white p-6 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:mx-auto md:max-w-md md:p-8 ${
          view !== "welcome" ? "flex-1" : ""
        }`}
      >
        {/* TELA 1: WELCOME (INICIAL) */}
        {view === "welcome" && (
          <div className="flex flex-col justify-between space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="relative h-10 w-32">
                <Image
                  src="/trivo_logo.png"
                  alt="Logo Trivo"
                  fill
                  className="object-contain brightness-0"
                  priority
                />
              </div>
              <p className="px-2 text-xs font-medium text-zinc-500">
                Sua melhor versão começa aqui!
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleOpenLogin("/", "signup")}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-black text-xs font-bold tracking-wider text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                CRIAR CONTA
              </button>

              <button
                type="button"
                onClick={() => handleOpenLogin("/", "login")}
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-xs font-bold tracking-wider text-zinc-900 transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                ENTRAR
              </button>
            </div>

            <div className="space-y-3 pt-1 text-center">
              <button
                type="button"
                onClick={() => handleOpenLogin("/admin", "login")}
                className="underline text-xs font-bold text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Acessar Admin
              </button>

              <p className="text-[10px] text-zinc-400">
                Ao continuar, você concorda com nossos{" "}
                <a href="#" className="underline">
                  Termos
                </a>{" "}
                e{" "}
                <a href="#" className="underline">
                  Privacidade
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* TELA 2: FORMULÁRIO (ENTRAR / CRIAR CONTA) */}
        {view !== "welcome" && (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                {view === "login" ? "Entrar" : "Criar Conta"}
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500">
                {view === "login"
                  ? "Insira seus dados abaixo para acessar sua conta."
                  : "Preencha as informações para começar."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {view === "signup" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Ex: Pedro Henrique"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={view === "signup"}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pr-4 pl-10 text-xs font-medium text-zinc-900 transition-all outline-none focus:border-black focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pr-4 pl-10 text-xs font-medium text-zinc-900 transition-all outline-none focus:border-black focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pr-10 pl-10 text-xs font-medium text-zinc-900 transition-all outline-none focus:border-black focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex h-12 w-full items-center justify-center rounded-2xl bg-black text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : view === "login" ? (
                  "ENTRAR"
                ) : (
                  "CONFIRMAR CADASTRO"
                )}
              </button>

              <div className="flex items-center gap-3 pt-2 pb-0.5">
                <div className="h-[1px] flex-1 bg-zinc-200" />
                <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Ou continue com
                </span>
                <div className="h-[1px] flex-1 bg-zinc-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-100"
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
                Google
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
