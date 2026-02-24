import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Busca disponibilidade internamente
const getAvailability = async (barbershopId: string, date: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/availability?barbershopId=${barbershopId}&date=${date}`,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    // Busca barbearias com serviços
    const barbershops = await prisma.barbershop.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phones: true,
        description: true,
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            priceInCents: true,
          },
        },
      },
    });

    // Verifica se o usuário está perguntando sobre disponibilidade
    const lastUserMessage = body.messages
      .filter((m: any) => m.role === "user")
      .at(-1)?.content?.toLowerCase() || "";

    // Atualiza essa parte no route.ts do chat
const isAskingAvailability =
  lastUserMessage.includes("horário") ||
  lastUserMessage.includes("horario") ||
  lastUserMessage.includes("horários") ||
  lastUserMessage.includes("horarios") ||
  lastUserMessage.includes("disponível") ||
  lastUserMessage.includes("disponivel") ||
  lastUserMessage.includes("disponibilidade") ||
  lastUserMessage.includes("vaga") ||
  lastUserMessage.includes("vagas") ||
  lastUserMessage.includes("agendar") ||
  lastUserMessage.includes("marcar") ||
  lastUserMessage.includes("amanhã") ||   
  lastUserMessage.includes("amanha") ||   
  lastUserMessage.includes("hoje") ||     
  lastUserMessage.includes("semana") ||   
  lastUserMessage.includes("hj") ||  
  lastUserMessage.includes("mês") || 
  lastUserMessage.includes("mes") ||   
  lastUserMessage.includes("quando");     


    // Monta contexto de disponibilidade se necessário
    let availabilityContext = "";

    if (isAskingAvailability) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return format(d, "yyyy-MM-dd");
  });

  const availabilityResults = await Promise.all(
    barbershops.map(async (b) => {
      const slots = await Promise.all(
        days.map(async (date) => {
          const data = await getAvailability(b.id, date);
          return { date, slots: data?.availableSlots ?? [] };
        }),
      );
      return { barbershop: b, slots };
    }),
  );

  availabilityContext =
    `\n\n📅 DISPONIBILIDADE DOS PRÓXIMOS 7 DIAS:\n` +
    availabilityResults
      .map(({ barbershop, slots }) => {
        const slotLines = slots
          .map(({ date, slots }) => {
            const label = format(new Date(date + "T12:00:00"), "EEEE dd/MM", {
              locale: ptBR,
            });
            const available = slots.length > 0 ? slots.join(", ") : "Sem vagas";
            return `  ${label}: ${available}`;
          })
          .join("\n");

        return `🏪 ${barbershop.name}:\n${slotLines}`;
      })
      .join("\n\n");
}
    // Monta contexto das barbearias
    const barbershopsContext = barbershops
      .map((b) => {
        const servicesList = b.services
          .map(
            (s) =>
              `    • [ID: ${s.id}] ${s.name} — R$ ${(s.priceInCents / 100).toFixed(2).replace(".", ",")} (${s.description})`,
          )
          .join("\n");

        return `📍 *${b.name}* [ID: ${b.id}]
  Endereço: ${b.address}
  Telefones: ${b.phones.join(", ")}
  Descrição: ${b.description}
  Serviços:
${servicesList || "    Nenhum serviço cadastrado"}`;
      })
      .join("\n\n");

    const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });

    const systemPrompt = `Você é o Aparatus AI, assistente de agendamentos de barbearia.
Seja simpático, objetivo e use emojis com moderação.
Hoje é ${today}.

As barbearias disponíveis no sistema são:

${barbershopsContext}
${availabilityContext}

Regras:
- Se o usuário perguntar sobre barbearias, liste os nomes e endereços.
- Se perguntar sobre serviços ou preços, mostre os serviços com preços.
- Se perguntar sobre horários ou disponibilidade, use os dados de DISPONIBILIDADE ATUAL acima.
- Se o usuário quiser agendar, colete: barbearia, serviço e horário desejado. Quando tiver tudo, confirme os detalhes antes de finalizar.
- Responda sempre em português do Brasil.
- Seja sempre educado e gentil.
- Quando o usuário pedir informações, responda com base nos dados fornecidos. Não invente informações.
- Se não souber a resposta, diga que não tem essa informação ao invés de inventar.
- Quando for passar informações, formate usando markdown para facilitar a leitura. Use negrito para nomes de barbearias e serviços, listas para detalhes e sempre tendo espaços e quebrando linhas pra deixar mais fluido e com aspecto bonito .`;


    const response = await groq.chat.completions.create({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  messages: [
    { role: "system", content: systemPrompt },
    ...body.messages.slice(-10).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content || "",
    })),
  ],
  max_tokens: 1024,
  stream: true,
});

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("🚨 ERRO:", error);
    return new Response("Erro interno", { status: 500 });
  }
};
