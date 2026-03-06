import type { SEOCheckItem } from "@/types";

export function checkSEO(params: {
  title: string;
  content: string;
  keyword: string;
  metaDescription: string;
  outline: { level: string; text: string }[];
  wordCount: number;
}): SEOCheckItem[] {
  const { title, content, keyword, metaDescription, outline, wordCount } =
    params;
  const keywordLower = keyword.toLowerCase();

  const checks: SEOCheckItem[] = [];

  // Title contains keyword
  checks.push({
    label: "タイトルにキーワードを含む",
    passed: title.toLowerCase().includes(keywordLower),
    detail: title,
  });

  // Title length
  checks.push({
    label: "タイトルが32文字以内",
    passed: title.length <= 32,
    detail: `${title.length}文字`,
  });

  // Meta description length
  checks.push({
    label: "メタディスクリプション 120〜160文字",
    passed: metaDescription.length >= 120 && metaDescription.length <= 160,
    detail: `${metaDescription.length}文字`,
  });

  // Meta contains keyword
  checks.push({
    label: "メタディスクリプションにキーワードを含む",
    passed: metaDescription.toLowerCase().includes(keywordLower),
  });

  // Word count
  checks.push({
    label: "文字数 3,000文字以上",
    passed: wordCount >= 3000,
    detail: `${wordCount.toLocaleString()}文字`,
  });

  // First 300 chars contain keyword
  const first300 = content.slice(0, 300).toLowerCase();
  checks.push({
    label: "冒頭300文字にキーワードを含む",
    passed: first300.includes(keywordLower),
  });

  // H2 count
  const h2Count = outline.filter((h) => h.level === "h2").length;
  checks.push({
    label: "H2が3つ以上",
    passed: h2Count >= 3,
    detail: `${h2Count}個`,
  });

  // H3 exists under H2s
  const h3Count = outline.filter((h) => h.level === "h3").length;
  checks.push({
    label: "H3が存在する",
    passed: h3Count >= 2,
    detail: `${h3Count}個`,
  });

  // Last H2 is summary
  const lastH2 = outline.filter((h) => h.level === "h2").pop();
  checks.push({
    label: "最後のH2がまとめ",
    passed: lastH2?.text.includes("まとめ") ?? false,
  });

  return checks;
}

export function calculateSEOScore(checks: SEOCheckItem[]): number {
  const passed = checks.filter((c) => c.passed).length;
  return Math.round((passed / checks.length) * 100);
}
