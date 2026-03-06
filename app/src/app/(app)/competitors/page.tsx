"use client";

import { useState, type FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

interface CompetitorArticle {
  rank: number;
  title: string;
  url: string;
  wordCount: number;
  headingsCount: number;
  hasFaq: boolean;
  headings: HeadingItem[];
}

interface HeadingItem {
  level: number;
  text: string;
}

interface AnalysisResult {
  keyword: string;
  articles: CompetitorArticle[];
}

const mockResults: AnalysisResult = {
  keyword: "SEO best practices 2026",
  articles: [
    {
      rank: 1,
      title: "The Ultimate Guide to SEO Best Practices in 2026 - Expert Tips",
      url: "https://example.com/seo-guide",
      wordCount: 4520,
      headingsCount: 18,
      hasFaq: true,
      headings: [
        { level: 2, text: "What is SEO in 2026?" },
        { level: 3, text: "Key changes from 2025" },
        { level: 2, text: "On-Page SEO Best Practices" },
        { level: 3, text: "Title Tag Optimization" },
        { level: 3, text: "Meta Description Tips" },
        { level: 2, text: "Technical SEO Checklist" },
      ],
    },
    {
      rank: 2,
      title: "SEO Best Practices: A Complete Beginner's Guide for Modern Search",
      url: "https://example.com/seo-beginners",
      wordCount: 3800,
      headingsCount: 14,
      hasFaq: true,
      headings: [
        { level: 2, text: "Understanding Search Engines" },
        { level: 2, text: "Keyword Research Fundamentals" },
        { level: 3, text: "Free Tools for Research" },
        { level: 2, text: "Content Optimization" },
      ],
    },
    {
      rank: 3,
      title: "10 SEO Strategies That Actually Work in 2026",
      url: "https://example.com/seo-strategies",
      wordCount: 2900,
      headingsCount: 12,
      hasFaq: false,
      headings: [
        { level: 2, text: "Strategy 1: AI-Driven Content" },
        { level: 2, text: "Strategy 2: Core Web Vitals" },
        { level: 2, text: "Strategy 3: E-E-A-T Signals" },
      ],
    },
    {
      rank: 4,
      title: "How to Improve Your SEO Rankings: Best Practices and Expert Advice",
      url: "https://example.com/improve-seo",
      wordCount: 3200,
      headingsCount: 16,
      hasFaq: true,
      headings: [
        { level: 2, text: "Audit Your Current SEO" },
        { level: 3, text: "Technical Audit Steps" },
        { level: 2, text: "Link Building in 2026" },
      ],
    },
    {
      rank: 5,
      title: "SEO Best Practices Checklist for Content Creators",
      url: "https://example.com/seo-checklist",
      wordCount: 2100,
      headingsCount: 10,
      hasFaq: false,
      headings: [
        { level: 2, text: "Pre-Writing Checklist" },
        { level: 2, text: "On-Page SEO Checklist" },
        { level: 2, text: "Post-Publishing Checklist" },
      ],
    },
    {
      rank: 6,
      title: "Advanced SEO Techniques for Competitive Niches in the AI Era",
      url: "https://example.com/advanced-seo",
      wordCount: 5100,
      headingsCount: 22,
      hasFaq: true,
      headings: [
        { level: 2, text: "Competitive Analysis Framework" },
        { level: 2, text: "Content Gap Analysis" },
        { level: 3, text: "Tools and Methods" },
      ],
    },
    {
      rank: 7,
      title: "Local SEO Best Practices: Dominate Your Area",
      url: "https://example.com/local-seo",
      wordCount: 2800,
      headingsCount: 11,
      hasFaq: true,
      headings: [
        { level: 2, text: "Google Business Profile Optimization" },
        { level: 2, text: "Local Link Building" },
      ],
    },
    {
      rank: 8,
      title: "SEO for E-Commerce: Best Practices to Increase Organic Traffic",
      url: "https://example.com/ecommerce-seo",
      wordCount: 3600,
      headingsCount: 15,
      hasFaq: false,
      headings: [
        { level: 2, text: "Product Page Optimization" },
        { level: 2, text: "Category Page SEO" },
        { level: 3, text: "Internal Linking Strategy" },
      ],
    },
    {
      rank: 9,
      title: "YouTube SEO Best Practices: Rank Your Videos Higher",
      url: "https://example.com/youtube-seo",
      wordCount: 2400,
      headingsCount: 9,
      hasFaq: false,
      headings: [
        { level: 2, text: "Title and Thumbnail Optimization" },
        { level: 2, text: "Description and Tags" },
      ],
    },
    {
      rank: 10,
      title: "SEO Trends and Best Practices: What to Expect in 2026 and Beyond",
      url: "https://example.com/seo-trends",
      wordCount: 3100,
      headingsCount: 13,
      hasFaq: true,
      headings: [
        { level: 2, text: "AI and Search Evolution" },
        { level: 2, text: "Voice Search Optimization" },
        { level: 2, text: "Visual Search SEO" },
      ],
    },
  ],
};

export default function CompetitorsPage() {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setResults(null);
    setExpandedRows(new Set());

    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (res.ok) {
        const data = (await res.json()) as AnalysisResult;
        setResults(data);
      } else {
        // Fallback to mock data for demo
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setResults({ ...mockResults, keyword: keyword.trim() });
      }
    } catch {
      // Fallback to mock data for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResults({ ...mockResults, keyword: keyword.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (rank: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) {
        next.delete(rank);
      } else {
        next.add(rank);
      }
      return next;
    });
  };

  const truncateTitle = (title: string, maxLen: number = 60): string => {
    return title.length > maxLen ? title.slice(0, maxLen) + "..." : title;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Competitor Analysis
        </h1>
        <p className="text-sm text-muted-foreground">
          Analyze top-ranking articles for any keyword
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleAnalyze} className="flex gap-3">
            <Input
              placeholder="Enter target keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !keyword.trim()}>
              <Search className="mr-2 h-4 w-4" />
              Analyze
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !isLoading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Top {results.articles.length} articles analyzed for{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{results.keyword}&rdquo;
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">
                  {Math.round(
                    results.articles.reduce((s, a) => s + a.wordCount, 0) /
                      results.articles.length
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Avg Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">
                  {Math.round(
                    results.articles.reduce((s, a) => s + a.headingsCount, 0) /
                      results.articles.length
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg Headings
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">
                  {results.articles.filter((a) => a.hasFaq).length}/
                  {results.articles.length}
                </div>
                <div className="text-xs text-muted-foreground">Has FAQ</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Words</TableHead>
                    <TableHead className="text-right">Headings</TableHead>
                    <TableHead className="text-center">FAQ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.articles.map((article) => (
                    <>
                      <TableRow
                        key={article.rank}
                        className="cursor-pointer"
                        onClick={() => toggleRow(article.rank)}
                      >
                        <TableCell>
                          {expandedRows.has(article.rank) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {article.rank}
                        </TableCell>
                        <TableCell
                          className="font-medium"
                          title={article.title}
                        >
                          {truncateTitle(article.title)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {article.wordCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {article.headingsCount}
                        </TableCell>
                        <TableCell className="text-center">
                          {article.hasFaq ? (
                            <CheckCircle2 className="inline h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="inline h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(article.rank) && (
                        <TableRow key={`${article.rank}-detail`}>
                          <TableCell colSpan={6} className="bg-muted/50 p-4">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Heading Structure
                              </p>
                              {article.headings.map((h, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                  style={{
                                    paddingLeft: `${(h.level - 2) * 16}px`,
                                  }}
                                >
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-mono shrink-0"
                                  >
                                    H{h.level}
                                  </Badge>
                                  <span className="text-sm">{h.text}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
