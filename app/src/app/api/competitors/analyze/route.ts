import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const RequestSchema = z.object({
  keyword: z.string().min(1, "keyword is required"),
});

interface CompetitorResult {
  position: number;
  title: string;
  url: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  wordCount: number;
}

interface SerpApiResult {
  organic_results?: Array<{
    position: number;
    title: string;
    link: string;
    snippet?: string;
  }>;
}

async function fetchSerpResults(keyword: string): Promise<SerpApiResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    q: keyword,
    engine: "google",
    google_domain: "google.co.jp",
    gl: "jp",
    hl: "ja",
    num: "10",
    api_key: apiKey,
  });

  const response = await fetch(
    `https://serpapi.com/search.json?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.status}`);
  }

  return response.json() as Promise<SerpApiResult>;
}

function extractHeadings(html: string): {
  h1: string[];
  h2: string[];
  h3: string[];
} {
  const h1s: string[] = [];
  const h2s: string[] = [];
  const h3s: string[] = [];

  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;

  let match: RegExpExecArray | null;

  match = h1Regex.exec(html);
  while (match !== null) {
    h1s.push(stripTags(match[1]));
    match = h1Regex.exec(html);
  }

  match = h2Regex.exec(html);
  while (match !== null) {
    h2s.push(stripTags(match[1]));
    match = h2Regex.exec(html);
  }

  match = h3Regex.exec(html);
  while (match !== null) {
    h3s.push(stripTags(match[1]));
    match = h3Regex.exec(html);
  }

  return { h1: h1s, h2: h2s, h3: h3s };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function countWords(html: string): number {
  const text = stripTags(html);
  return text.length;
}

function extractMetaDescription(html: string): string {
  const metaRegex =
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i;
  const altRegex =
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i;

  const match = metaRegex.exec(html) || altRegex.exec(html);
  return match ? match[1] : "";
}

async function analyzeCompetitorPage(
  url: string,
  position: number,
  title: string,
  snippet: string
): Promise<CompetitorResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BlogAnalyzer/1.0; +https://example.com)",
        Accept: "text/html",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        position,
        title,
        url,
        metaDescription: snippet,
        headings: { h1: [], h2: [], h3: [] },
        wordCount: 0,
      };
    }

    const html = await response.text();
    const headings = extractHeadings(html);
    const wordCount = countWords(html);
    const metaDescription = extractMetaDescription(html) || snippet;

    return {
      position,
      title,
      url,
      metaDescription,
      headings,
      wordCount,
    };
  } catch {
    return {
      position,
      title,
      url,
      metaDescription: snippet,
      headings: { h1: [], h2: [], h3: [] },
      wordCount: 0,
    };
  }
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

    const { keyword } = parseResult.data;

    const serpData = await fetchSerpResults(keyword);

    if (!serpData.organic_results || serpData.organic_results.length === 0) {
      return NextResponse.json(
        { error: "No search results found", keyword },
        { status: 404 }
      );
    }

    const analysisPromises = serpData.organic_results
      .slice(0, 10)
      .map((result) =>
        analyzeCompetitorPage(
          result.link,
          result.position,
          result.title,
          result.snippet ?? ""
        )
      );

    const competitors = await Promise.all(analysisPromises);

    return NextResponse.json({
      keyword,
      totalResults: competitors.length,
      competitors,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
