import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { anthropic } from "@/lib/anthropic";
import { generateMetaPrompt } from "@/lib/prompts";

const RequestSchema = z.object({
  title: z.string().min(1, "title is required"),
  content: z.string().min(1, "content is required"),
  keyword: z.string().min(1, "keyword is required"),
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

    const { title, content, keyword } = parseResult.data;

    const { system, user } = generateMetaPrompt({ title, content, keyword });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textContent = response.content.find(
      (block) => block.type === "text"
    );

    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    let meta: unknown;
    try {
      meta = JSON.parse(textContent.text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON", raw: textContent.text },
        { status: 500 }
      );
    }

    return NextResponse.json({ articleId: id, meta });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
