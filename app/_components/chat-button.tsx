import Link from "next/link";
import { MessageCircle } from "lucide-react"; // Usaremos o ícone de balão de fala

export function ChatButton() {
  return (
    <Link
      href="/chats"
      // A classe "fixed bottom-6 right-6" prende o botão no canto inferior direito
      // O "z-50" garante que ele fique por cima de tudo na tela
      className="fixed bottom-12 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1546A1] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="Abrir chat com o assistente"
    >
      <MessageCircle size={28} />
    </Link>
  );
}