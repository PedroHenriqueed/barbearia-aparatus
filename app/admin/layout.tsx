import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma as db } from "@/lib/prisma";
import AdminSidebar from "./_components/admin-sidebar";
import AdminBottomNav from "./_components/admin-bottom-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/");
  }

  const barbershop = await db.barbershop.findFirst({
    where: { userId: session.user.id },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      {/* Sidebar para telas grandes (Desktop/Tablet) */}
      <AdminSidebar barbershop={barbershop} />

      {/* Conteúdo principal com padding no rodapé para o mobile */}
      <main className="flex-1 overflow-y-auto bg-[#09090b] p-6 pt-16 pb-24 md:p-10 md:pb-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Menu Inferior Fixo exclusivo do celular */}
      <AdminBottomNav />
    </div>
  );
}
