"use client";

import { ChevronLeft, Sparkles, Send, Loader2, Mic } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import Stripe from "stripe";


type Message = { id: string; role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content:
        "Olá! Sou o TrivoIA, seu assistente pessoal.\n\nEstou aqui para te auxiliar a agendar seu corte ou barba, encontrar as barbearias disponíveis perto de você e responder às suas dúvidas.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || inputValue.trim() === "") return;

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
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) throw new Error("Erro na API");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantText += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantText } : m,
          ),
        );
      }
    } catch (error) {
      console.error("❌ Erro:", error);
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
          <ChevronLeft size={24} className="text-blue-600 hover:text-black" />
        </Link>
       <Image src="/trivo_logo.png" alt="Trivo" height={18} width={110} className=" flex items-center"/>

        <div className="w-[24px] flex items-center"></div>
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-700">
                  <Sparkles size={16} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "rounded-tr-sm bg-gray-100 text-gray-800"
                    : "rounded-tl-sm border border-gray-100 text-gray-800"
                }`}
              >
                {m.content === "" && m.role === "assistant" ? (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : m.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="border-t border-solid border-gray-100 bg-white p-5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            id="chat-input"
            name="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua mensagem"
            className="h-14 w-full rounded-full border border-gray-200 bg-white pl-5 pr-24 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
            autoComplete="off"
            disabled={isLoading}
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1546A1] text-white transition-colors hover:bg-[#60A5FA]"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={isLoading || !inputValue}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1546A1] text-white transition-colors hover:bg-[#60A5FA] disabled:cursor-not-allowed disabled:opacity-50"
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
