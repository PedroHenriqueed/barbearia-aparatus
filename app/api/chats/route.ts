import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Helpers ───────────────────────────────────────────────────────────────

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

const extractBookingIntent = (text: string) => {
  const match = text.match(/\[\s*AGENDAR\s*:\s*(\{.*?\})\s*\]/s);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

const extractCancelIntent = (text: string) => {
  const match = text.match(/\[\s*CANCELAR\s*:\s*(\{.*?\})\s*\]/s);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

const sendStream = (text: string) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
};

// ─── Route Handler ─────────────────────────────────────────────────────────

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id ?? null;

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

    const lastUserMessage =
      body.messages
        .filter((m: any) => m.role === "user")
        .at(-1)
        ?.content?.toLowerCase() || "";

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
      lastUserMessage.includes("quando") ||
      lastUserMessage.includes("confirmar") ||
      lastUserMessage.includes("confirmo") ||
      lastUserMessage.includes("pode agendar") ||
      lastUserMessage.includes("sim");

    // ─── Disponibilidade ───────────────────────────────────────────────

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
                const label = format(
                  new Date(date + "T12:00:00"),
                  "EEEE dd/MM",
                  { locale: ptBR },
                );
                const available =
                  slots.length > 0 ? slots.join(", ") : "Sem vagas";
                return `  ${label}: ${available}`;
              })
              .join("\n");
            return `🏪 ${barbershop.name}:\n${slotLines}`;
          })
          .join("\n\n");
    }

    // ─── Agendamentos do usuário ───────────────────────────────────────

    let userBookingsContext = "";

    if (userId) {
      const userBookings = await prisma.booking.findMany({
        where: {
          userId,
          cancelled: false,
          date: { gte: new Date() },
        },
        include: {
          service: true,
          barbershop: true,
        },
        orderBy: { date: "asc" },
      });

      if (userBookings.length > 0) {
        userBookingsContext =
          `\n\n📋 AGENDAMENTOS DO USUÁRIO:\n` +
          userBookings
            .map((b) => {
              const dateFormatted = format(b.date, "EEEE dd/MM 'às' HH:mm", {
                locale: ptBR,
              });
              return `  • [ID: ${b.id}] ${b.service.name} em ${b.barbershop.name} — ${dateFormatted}`;
            })
            .join("\n");
      } else {
        userBookingsContext = `\n\n📋 AGENDAMENTOS DO USUÁRIO: Nenhum agendamento futuro encontrado.`;
      }
    }

    // ─── Contexto das barbearias ───────────────────────────────────────

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

    const userInfo = userId
      ? `O usuário está logado. ID do usuário: ${userId}`
      : `O usuário NÃO está logado. Se ele quiser agendar ou cancelar, diga que precisa estar logado.`;

    // ─── System Prompt ─────────────────────────────────────────────────

    const systemPrompt = `Você é o Aparatus AI, assistente de agendamentos de barbearia.
Seja simpático, objetivo e use emojis com moderação.
Hoje é ${today}.
${userInfo}

As barbearias disponíveis no sistema são:

${barbershopsContext}
${availabilityContext}
${userBookingsContext}

Regras:
- NUNCA mostre IDs (de barbearia, serviço ou agendamento) nas suas respostas ao usuário.
- Os IDs existem apenas para uso interno nos blocos [AGENDAR:] e [CANCELAR:], nunca no texto visível.
- Se o usuário perguntar sobre barbearias, liste apenas nomes e endereços.
- Se perguntar sobre serviços ou preços, mostre apenas nome, preço e descrição.
- Se perguntar sobre horários ou disponibilidade, use os dados de DISPONIBILIDADE ATUAL acima.
- Se o usuário quiser agendar, colete: barbearia, serviço e horário desejado.
- Quando tiver barbearia + serviço + horário, confirme os detalhes com o usuário antes de finalizar.
- Quando o usuário CONFIRMAR o agendamento, responda normalmente E inclua ao final (sem espaços extras):
  [AGENDAR:{"barbershopId":"ID","serviceId":"ID","date":"YYYY-MM-DDTHH:mm:ss"}]
- Se o usuário quiser CANCELAR um agendamento, mostre apenas: nome do serviço, barbearia e data/hora. Nunca o ID.
- Quando o usuário confirmar qual agendamento cancelar, responda normalmente E inclua ao final (sem espaços extras):
  [CANCELAR:{"bookingId":"ID_DO_AGENDAMENTO"}]
- IMPORTANTE: Os blocos [AGENDAR:] e [CANCELAR:] devem ser escritos SEM espaços internos, exatamente como mostrado acima.
- O campo date deve estar no formato ISO 8601 com data e hora corretas.
- Responda sempre em português do Brasil.
- Seja sempre educado e gentil.
- Não invente informações. Se não souber, diga que não tem essa informação.
- Formate usando markdown para facilitar a leitura.`;

    // ─── Chamada à IA ──────────────────────────────────────────────────

    const aiResponse = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...body.messages.slice(-10).map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content || "",
        })),
      ],
      max_tokens: 1024,
      stream: false,
    });

    let fullText =
      aiResponse.choices[0]?.message?.content || "Desculpe, ocorreu um erro.";

    // ─── Processa AGENDAMENTO ──────────────────────────────────────────

    const bookingIntent = extractBookingIntent(fullText);

    if (bookingIntent && userId) {
      try {
        const { barbershopId, serviceId, date } = bookingIntent;

        const service = await prisma.barbershopService.findUnique({
          where: { id: serviceId },
        });

        if (!service) {
          fullText = fullText.replace(/\[\s*AGENDAR\s*:.*?\]/s, "").trim();
          fullText += "\n\n⚠️ Serviço não encontrado.";
        } else {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2025-10-29.clover",
          });

          const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "brl",
                  product_data: { name: service.name },
                  unit_amount: service.priceInCents,
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat`,
            metadata: {
              serviceId,
              barbershopId,
              userId,
              date,
            },
          });

          fullText = fullText.replace(/\[\s*AGENDAR\s*:.*?\]/s, "").trim();
          fullText += `\n\n💳 Para confirmar, finalize o pagamento:\n[Clique aqui para pagar](${checkoutSession.url})`;
        }
      } catch (err) {
        console.error("❌ Erro ao criar sessão Stripe:", err);
        fullText = fullText.replace(/\[\s*AGENDAR\s*:.*?\]/s, "").trim();
        fullText +=
          "\n\n⚠️ Houve um problema ao gerar o link de pagamento. Tente novamente.";
      }
    } else if (bookingIntent && !userId) {
      fullText = fullText.replace(/\[\s*AGENDAR\s*:.*?\]/s, "").trim();
      fullText += "\n\n🔒 Para agendar, você precisa estar **logado**.";
    } else {
      fullText = fullText.replace(/\[\s*AGENDAR\s*:.*?\]/s, "").trim();
    }

    // ─── Processa CANCELAMENTO ─────────────────────────────────────────

    const cancelIntent = extractCancelIntent(fullText);

    if (cancelIntent && userId) {
      try {
        const { bookingId } = cancelIntent;

        const booking = await prisma.booking.findUnique({
          where: { id: bookingId, userId },
        });

        if (!booking) {
          fullText = fullText.replace(/\[\s*CANCELAR\s*:.*?\]/s, "").trim();
          fullText +=
            "\n\n⚠️ Agendamento não encontrado ou não pertence à sua conta.";
        } else {
          if (booking.paymentId) {
            try {
              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2024-12-18.acacia",
              });

              await stripe.refunds.create({ charge: booking.paymentId });
              console.log(`✅ Estorno realizado: ${booking.paymentId}`);
            } catch (stripeError: any) {
              console.error("❌ Erro no estorno Stripe:", stripeError.message);
              fullText = fullText.replace(/\[\s*CANCELAR\s*:.*?\]/s, "").trim();
              fullText +=
                "\n\n⚠️ Erro ao processar o estorno do pagamento. Tente novamente.";
              return sendStream(fullText);
            }
          }

          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              cancelled: true,
              cancelledAt: new Date(),
            },
          });

          fullText = fullText.replace(/\[\s*CANCELAR\s*:.*?\]/s, "").trim();
          fullText += booking.paymentId
            ? "\n\n✅ **Agendamento cancelado e estorno solicitado!** O valor será devolvido em até 5-10 dias úteis."
            : "\n\n✅ **Agendamento cancelado com sucesso!**";
        }
      } catch (err) {
        console.error("❌ Erro ao cancelar booking:", err);
        fullText = fullText.replace(/\[\s*CANCELAR\s*:.*?\]/s, "").trim();
        fullText +=
          "\n\n⚠️ Houve um problema ao cancelar o agendamento. Tente novamente.";
      }
    } else if (cancelIntent && !userId) {
      fullText = fullText.replace(/\[\s*CANCELAR\s*:.*?\]/s, "").trim();
      fullText += "\n\n🔒 Para cancelar, você precisa estar **logado**.";
    } else {
      fullText = fullText.replace(/\[\s*CANCELAR\s*:.*?\]/s, "").trim();
    }

    return sendStream(fullText);
  } catch (error: any) {
    console.error("🚨 ERRO:", error);
    return new Response("Erro interno", { status: 500 });
  }
};
