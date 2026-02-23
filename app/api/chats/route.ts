import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    // Busca barbearias
    const barbershops = await prisma.barbershop.findMany({
      select: { id: true, name: true, address: true, phones: true },
    });
    console.log("🏪 Barbearias encontradas:", barbershops.length, barbershops);


    const systemPrompt = `Você é o Aparatus AI, assistente de agendamentos de barbearia.
Seja simpático e objetivo. 
As barbearias disponíveis no sistema são:
${barbershops.map((b) => `- ${b.name} (${b.address})`).join("\n")}

Se o usuário perguntar sobre barbearias, liste as acima de forma amigável.
Se não souber algo, diga que pode ajudar com agendamentos.`;

    // Monta histórico no formato OpenAI (que o Groq usa)
    const messages = [
      { role: "system", content: systemPrompt },
      ...body.messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content || "",
      })),
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
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
