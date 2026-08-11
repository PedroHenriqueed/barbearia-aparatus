import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "./_providers/query-providers";
import BottomNav from "./_components/bottomNav";
import BottomNavWrapper from "./_components/bottowNavWrapper";


const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trivo",
  description: "Trivo é uma plataforma de agendamento para barbearias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${jakarta.variable} ${geistMono.variable} font-sans antialiased`}>
        <QueryProvider>
          <main className="pb-16">
            {children}
          </main>
          <BottomNavWrapper />
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
