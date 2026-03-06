// Article outline structure
export interface OutlineNode {
  id: string;
  level: "h1" | "h2" | "h3";
  text: string;
  summary: string;
  children?: OutlineNode[];
}

// Competitor analysis result
export interface CompetitorResult {
  rank: number;
  url: string;
  title: string;
  wordCount: number;
  headings: { level: string; text: string }[];
  coOccurrenceWords: string[];
  metaDescription: string;
  hasFaqSchema: boolean;
}

// Meta generation result
export interface MetaCandidate {
  text: string;
  charCount: number;
}

export interface TitleCandidate {
  text: string;
  pattern: "number" | "question" | "howto" | "comparison" | "experience";
  charCount: number;
}

// Platform distribution
export interface PlatformContentResult {
  platform: "note" | "x_long" | "x_post";
  content: string;
  posts?: string[]; // for x_post, array of individual posts
  cannibalizationScore: number;
}

// SEO checklist
export interface SEOCheckItem {
  label: string;
  passed: boolean;
  detail?: string;
}

// Dashboard KPI
export interface KPIData {
  label: string;
  value: number;
  change: number; // percentage
  changeType: "up" | "down" | "neutral";
}

// Blog config for knowledge templates
export type BlogType = "marketing" | "beauty";

export interface BlogConfig {
  id: string;
  name: string;
  type: BlogType;
  url: string;
  accent: string;
  accentLight: string;
}

export const BLOG_CONFIGS: Record<BlogType, Omit<BlogConfig, "id" | "url">> = {
  marketing: {
    name: "マーケブログ",
    type: "marketing",
    accent: "#2563eb",
    accentLight: "#eff6ff",
  },
  beauty: {
    name: "美容ブログ",
    type: "beauty",
    accent: "#e11d48",
    accentLight: "#fff1f2",
  },
};
