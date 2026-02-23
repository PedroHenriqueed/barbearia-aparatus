"use client";

import { ChevronLeft, Sparkles, Send, Loader2, Mic } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Tipo para as mensagens (para não depender da biblioteca quebrada)
type Message = { id: string; role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();

  // 1. Estados nativos do React
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Olá! Sou o Aparatus, seu assistente pessoal.\n\nEstou aqui para te auxiliar a agendar seu corte ou barba, encontrar as barbearias disponíveis perto de você e responder às suas dúvidas.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Nossa função mágica de envio usando Fetch nativo
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || inputValue.trim() === "") return;

    // A. Salva a mensagem do usuário na tela e limpa o campo
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // B. Envia para o nosso próprio backend (route.ts)
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviamos o histórico todo no formato exato que a IA espera
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) throw new Error("Erro na API");

      // C. A mágica de ler a resposta da IA como texto (sem bibliotecas)
      const text = await response.text();

      // D. Salva a resposta da IA na tela
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: text },
      ]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Ocorreu um erro. Tente enviar de novo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-solid border-gray-100 p-5">
        <Link href="/">
        <ChevronLeft size={24} className="text-gray-600 hover:text-black" />
        </Link>

        <h1 className="flex-none grow-0 text-center font-['Merriweather'] text-[20px] leading-[140%] font-normal tracking-[-0.05em] text-black italic">
          Aparatus
        </h1>
        <div className="w-[24px] flex-none"></div>
      </header>

      {/* AVISO DE STATUS */}
      <div className="px-5 pt-5 pb-2">
        <div className="rounded-lg border border-gray-100 bg-gray-50 py-3 text-center text-sm text-gray-400">
          Seu assistente de agendamentos está online.
        </div>
      </div>

      {/* ÁREA DAS MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col gap-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-green-700">
                  <Sparkles size={16} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "rounded-tr-sm bg-gray-100 text-gray-800"
                    : "rounded-tl-sm border border-gray-100 text-gray-800"
                }`}
              >
                {/* Nossa propriedade 'content' agora é 100% garantida */}
                {m.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* RODAPÉ (INPUT DE TEXTO E BOTÕES) */}
      <div className="border-t border-solid border-gray-100 bg-white p-5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            id="chat-input"
            name="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua mensagem"
            // Aumentei o pr-14 para pr-24 para caberem os dois botões
            className="h-14 w-full rounded-full border border-gray-200 bg-white pl-5 pr-24 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
            autoComplete="off"
            disabled={isLoading}
          />
          
          {/* Container para agrupar os botões na direita */}
          <div className="absolute right-2 flex items-center gap-1">
            
            {/* NOVO BOTÃO (Microfone / Futuro) */}
            <button
              type="button"
              // preventDefault evita que o botão faça o formulário recarregar a tela por acidente
              onClick={(e) => e.preventDefault()} 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E4A35] text-white transition-colors hover:bg-[#1f3324] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic size={20} />
            </button>

            {/* BOTÃO DE ENVIAR TEXTO (Existente) */}
            <button
              type="submit"
              disabled={isLoading || !inputValue}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E4A35] text-white transition-colors hover:bg-[#1f3324] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="mr-0.5 mt-0.5" />
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
