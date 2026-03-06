import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { anthropic } from "@/lib/anthropic";
import { generatePlatformPrompt, type BlogType, type Platform } from "@/lib/prompts";
import prisma from "@/lib/prisma";

const RequestSchema = z.object({
  articleId: z.string().min(1, "articleId is required"),
  platform: z.enum(["note", "x_long", "x_post"]),
  blogType: z.enum(["marketing", "beauty"]),
});

function calculateCannibalizationScore(
  original: string,
  transformed: string
): number {
  const normalize = (text: string): string[] => {
    return text
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);
  };

  const originalWords = normalize(original);
  const transformedWords = normalize(transformed);

  if (originalWords.length === 0 || transformedWords.length === 0) {
    return 0;
  }

  const originalSet = new Set(originalWords);
  const transformedSet = new Set(transformedWords);

  let overlap = 0;
  for (const word of transformedSet) {
    if (originalSet.has(word)) {
      overlap++;
    }
  }

  const unionSize = new Set([...originalSet, ...transformedSet]).size;
  const score = unionSize > 0 ? (overlap / unionSize) * 100 : 0;

  return Math.round(score * 10) / 10;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = RequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { articleId, platform, blogType } = parseResult.data;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found", articleId },
        { status: 404 }
      );
    }

    const content = article.content as string;
    if (!content) {
      return NextResponse.json(
        { error: "Article has no content", articleId },
        { status: 400 }
      );
    }

    const { system, user } = generatePlatformPrompt({
      content,
      blogType: blogType as BlogType,
      platform: platform as Platform,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
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

    const transformedContent = textContent.text;

    let parsedContent: unknown = transformedContent;
    if (platform === "x_post") {
      try {
        parsedContent = JSON.parse(transformedContent);
      } catch {
        parsedContent = { raw: transformedContent };
      }
    }

    const cannibalizationScore = calculateCannibalizationScore(
      content,
      transformedContent
    );

    return NextResponse.json({
      articleId,
      platform,
      blogType,
      content: parsedContent,
      cannibalizationScore,
      cannibalizationLevel:
        cannibalizationScore > 60
          ? "high"
          : cannibalizationScore > 30
            ? "medium"
            : "low",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
