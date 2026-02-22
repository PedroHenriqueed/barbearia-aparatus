import { streamText, convertToModelMessages } from "ai";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const POST = async (request: Request) => {
  const body = await request.json();

  console.log("BODY COMPLETO:", JSON.stringify(body, null, 2)); // 👈 debug
  console.log("TIPO DO MESSAGES:", typeof body.messages); // 👈 debug

  const { messages } = body;

  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: "Você é o Aparatus AI...",
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
};
