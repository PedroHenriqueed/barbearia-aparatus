"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { ChatMessage } from "./_components/chat-message";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  // Na versão nova, usamos o transport e o sendMessage!
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chats",
    }),
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage({ text: message }); // O Vercel mudou de 'content' para 'text' nas versões novas
    setMessage(""); // Limpa o input após o envio
  };

  return (
    <div className="flex h-screen flex-col p-4">
      {/* Área das mensagens */}
      <div className="mb-4 flex-1 overflow-y-auto">
        {messages.map((m) => (
          // Usando o seu componente ChatMessage como você queria!
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>

      {/* Input e Botão */}
      <div className="flex gap-2">
        <input
          id="chat-message"
          name="chat-message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            // Permite enviar apertando a tecla Enter
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-md border border-gray-300 p-2"
        />
        <button
          onClick={handleSend}
          disabled={status === "submitted" || status === "streaming"} // Desabilita enquanto carrega
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {status === "streaming" ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
