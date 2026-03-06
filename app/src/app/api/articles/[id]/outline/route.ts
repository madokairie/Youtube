import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { anthropic } from "@/lib/anthropic";
import { generateOutlinePrompt, type BlogType } from "@/lib/prompts";

const RequestSchema = z.object({
  keyword: z.string().min(1, "keyword is required"),
  blogType: z.enum(["marketing", "beauty"]),
  competitors: z.array(z.string()).optional().default([]),
  coOccurrenceWords: z.array(z.string()).optional().default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = RequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { keyword, blogType, competitors, coOccurrenceWords } =
      parseResult.data;

    const { system, user } = generateOutlinePrompt({
      keyword,
      blogType: blogType as BlogType,
      competitors,
      coOccurrenceWords,
    });

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              );
            }
          }

          const finalMessage = await stream.finalMessage();
          const fullText = finalMessage.content
            .filter((block) => block.type === "text")
            .map((block) => {
              if (block.type === "text") return block.text;
              return "";
            })
            .join("");

          let outline: unknown;
          try {
            outline = JSON.parse(fullText);
          } catch {
            outline = { raw: fullText };
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, outline })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Stream processing failed";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
