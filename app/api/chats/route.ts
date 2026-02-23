import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const POST = async (request: Request) => {
  const body = await request.json();

  console.log("BODY COMPLETO:", JSON.stringify(body, null, 2));

  const { messages } = body;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system:
      "Você é o Aparatus AI, um assistente virtual de agendamento de barbearias...",
    messages,
  });

  return result.toTextStreamResponse(); // ✅ AQUI
};
