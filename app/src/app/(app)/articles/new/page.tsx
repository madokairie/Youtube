"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Save,
  Eye,
  FileEdit,
  ListOrdered,
  Type,
  Sparkles,
} from "lucide-react";

// --- Types ---

interface HeadingNode {
  id: string;
  level: number;
  text: string;
  children: HeadingNode[];
}

interface MetaCandidate {
  id: string;
  text: string;
}

interface TitleCandidate {
  id: string;
  text: string;
}

interface SeoCheckItem {
  label: string;
  passed: boolean;
}

// --- Mock data ---

const mockKeyword = "SEO best practices 2026";

const mockOutline: HeadingNode[] = [
  {
    id: "h2-1",
    level: 2,
    text: "What Are SEO Best Practices?",
    children: [
      { id: "h3-1a", level: 3, text: "Definition and Importance", children: [] },
      { id: "h3-1b", level: 3, text: "How SEO Has Evolved", children: [] },
    ],
  },
  {
    id: "h2-2",
    level: 2,
    text: "On-Page SEO Techniques",
    children: [
      { id: "h3-2a", level: 3, text: "Title Tag Optimization", children: [] },
      { id: "h3-2b", level: 3, text: "Header Structure Best Practices", children: [] },
      { id: "h3-2c", level: 3, text: "Internal Linking Strategy", children: [] },
    ],
  },
  {
    id: "h2-3",
    level: 2,
    text: "Technical SEO Essentials",
    children: [
      { id: "h3-3a", level: 3, text: "Core Web Vitals Optimization", children: [] },
      { id: "h3-3b", level: 3, text: "Mobile-First Indexing", children: [] },
    ],
  },
  {
    id: "h2-4",
    level: 2,
    text: "Content Quality and E-E-A-T",
    children: [
      { id: "h3-4a", level: 3, text: "Demonstrating Expertise", children: [] },
      { id: "h3-4b", level: 3, text: "Building Authority Signals", children: [] },
    ],
  },
  {
    id: "h2-5",
    level: 2,
    text: "Link Building in 2026",
    children: [
      { id: "h3-5a", level: 3, text: "Ethical Link Acquisition", children: [] },
    ],
  },
];

const mockGeneratedContent = `Search engine optimization continues to evolve rapidly. In 2026, the landscape has shifted significantly with AI-driven search experiences becoming the norm. Understanding and implementing SEO best practices is no longer optional for any serious content creator or business.

## What Are SEO Best Practices?

SEO best practices are the established guidelines and techniques that help web pages rank higher in search engine results pages (SERPs). These practices encompass everything from content quality and keyword optimization to technical infrastructure and user experience.

### Definition and Importance

At its core, SEO is about making your content discoverable and valuable to both search engines and users. The importance of following best practices cannot be overstated, as organic search remains the primary driver of website traffic for most businesses.

### How SEO Has Evolved

The evolution from keyword stuffing to sophisticated AI-driven content analysis marks one of the most dramatic shifts in digital marketing history. Modern SEO requires a holistic approach that considers user intent, content depth, and technical excellence.

## On-Page SEO Techniques

On-page optimization remains the foundation of any successful SEO strategy. These are the elements you have direct control over on your website.

### Title Tag Optimization

Your title tag is often the first impression users get of your content. In 2026, search engines have become even better at understanding the semantic meaning behind titles, making it crucial to write titles that are both descriptive and compelling.

### Header Structure Best Practices

A well-organized header structure (H1, H2, H3) helps both search engines and users understand the hierarchy and flow of your content. Each heading should accurately describe the section that follows.

### Internal Linking Strategy

Strategic internal linking distributes page authority throughout your site and helps search engines discover and index your content more effectively. Aim for contextually relevant links that genuinely help readers navigate related topics.`;

const mockMetaCandidates: MetaCandidate[] = [
  {
    id: "meta-1",
    text: "Learn the essential SEO best practices for 2026. This comprehensive guide covers on-page optimization, technical SEO, E-E-A-T, and link building strategies to boost your rankings.",
  },
  {
    id: "meta-2",
    text: "Master SEO in 2026 with our expert guide to best practices. From Core Web Vitals to AI-driven content, discover proven techniques for higher search rankings.",
  },
  {
    id: "meta-3",
    text: "Stay ahead with the latest SEO best practices for 2026. Covers keyword research, technical optimization, content quality signals, and ethical link building strategies.",
  },
];

const mockTitleCandidates: TitleCandidate[] = [
  { id: "title-1", text: "SEO Best Practices 2026: The Complete Guide to Higher Rankings" },
  { id: "title-2", text: "17 Proven SEO Best Practices for 2026 (Expert-Backed)" },
  { id: "title-3", text: "SEO Best Practices: Everything You Need to Know in 2026" },
  { id: "title-4", text: "The Ultimate SEO Best Practices Guide for 2026 and Beyond" },
  { id: "title-5", text: "How to Master SEO in 2026: Best Practices That Actually Work" },
];

// --- Component ---

export default function NewArticlePage() {
  const [currentStep, setCurrentStep] = useState("step-1");
  const [h1Title, setH1Title] = useState(
    "SEO Best Practices 2026: A Comprehensive Guide"
  );
  const [outline, setOutline] = useState<HeadingNode[]>(mockOutline);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [selectedMeta, setSelectedMeta] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [outlineGenerated, setOutlineGenerated] = useState(false);

  const handleGenerateOutline = async () => {
    setIsGeneratingOutline(true);
    await new Promise((r) => setTimeout(r, 1200));
    setOutline(mockOutline);
    setOutlineGenerated(true);
    setIsGeneratingOutline(false);
  };

  const handleGenerateContent = async () => {
    setIsGeneratingContent(true);
    setGeneratedContent("");
    setWordCount(0);

    // Simulate streaming
    const words = mockGeneratedContent.split(" ");
    for (let i = 0; i < words.length; i += 3) {
      await new Promise((r) => setTimeout(r, 30));
      const chunk = words.slice(0, i + 3).join(" ");
      setGeneratedContent(chunk);
      setWordCount(chunk.split(/\s+/).filter(Boolean).length);
    }

    setGeneratedContent(mockGeneratedContent);
    setWordCount(mockGeneratedContent.split(/\s+/).filter(Boolean).length);
    setIsGeneratingContent(false);
  };

  const updateHeading = (id: string, newText: string) => {
    const updateNode = (nodes: HeadingNode[]): HeadingNode[] =>
      nodes.map((node) => ({
        ...node,
        text: node.id === id ? newText : node.text,
        children: updateNode(node.children),
      }));
    setOutline(updateNode(outline));
  };

  const seoChecks: SeoCheckItem[] = [
    {
      label: "Keyword in title",
      passed: (selectedTitle
        ? mockTitleCandidates.find((t) => t.id === selectedTitle)?.text ?? ""
        : h1Title
      )
        .toLowerCase()
        .includes("seo"),
    },
    {
      label: "Meta description length (120-160 chars)",
      passed: selectedMeta
        ? (() => {
            const len =
              mockMetaCandidates.find((m) => m.id === selectedMeta)?.text
                .length ?? 0;
            return len >= 120 && len <= 160;
          })()
        : false,
    },
    { label: "H2 count >= 3", passed: outline.length >= 3 },
    { label: "Word count >= 1500", passed: wordCount >= 1500 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create New Article
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate SEO-optimized content step by step
        </p>
      </div>

      <Tabs value={currentStep} onValueChange={setCurrentStep}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="step-1" className="gap-2">
            <ListOrdered className="h-4 w-4" />
            <span className="hidden sm:inline">1. Outline</span>
            <span className="sm:hidden">1</span>
          </TabsTrigger>
          <TabsTrigger value="step-2" className="gap-2">
            <FileEdit className="h-4 w-4" />
            <span className="hidden sm:inline">2. Content</span>
            <span className="sm:hidden">2</span>
          </TabsTrigger>
          <TabsTrigger value="step-3" className="gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">3. Meta & Title</span>
            <span className="sm:hidden">3</span>
          </TabsTrigger>
          <TabsTrigger value="step-4" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">4. Preview</span>
            <span className="sm:hidden">4</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Keyword & Outline */}
        <TabsContent value="step-1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Target Keyword</CardTitle>
              <CardDescription>
                Generating outline based on competitor analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  Keyword
                </Badge>
                <span className="font-semibold">{mockKeyword}</span>
              </div>
              <Button
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline}
              >
                {isGeneratingOutline ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Outline
              </Button>
            </CardContent>
          </Card>

          {outlineGenerated && (
            <Card>
              <CardHeader>
                <CardTitle>Article Outline</CardTitle>
                <CardDescription>
                  Click on any heading to edit it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* H1 */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    H1
                  </label>
                  <Input
                    value={h1Title}
                    onChange={(e) => setH1Title(e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>

                <Separator />

                {/* H2/H3 cards */}
                <div className="space-y-3">
                  {outline.map((h2) => (
                    <Card key={h2.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="shrink-0 font-mono"
                          >
                            H2
                          </Badge>
                          <Input
                            value={h2.text}
                            onChange={(e) =>
                              updateHeading(h2.id, e.target.value)
                            }
                            className="font-semibold"
                          />
                        </div>
                        {h2.children.map((h3) => (
                          <div
                            key={h3.id}
                            className="flex items-center gap-2 pl-6"
                          >
                            <Badge
                              variant="outline"
                              className="shrink-0 font-mono text-xs"
                            >
                              H3
                            </Badge>
                            <Input
                              value={h3.text}
                              onChange={(e) =>
                                updateHeading(h3.id, e.target.value)
                              }
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setCurrentStep("step-2");
                    handleGenerateContent();
                  }}
                >
                  Approve & Generate
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Step 2: Content Generation */}
        <TabsContent value="step-2" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Sidebar: Outline */}
            <div className="hidden lg:block">
              <Card className="sticky top-20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Outline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm font-semibold truncate">{h1Title}</p>
                  <Separator className="my-2" />
                  {outline.map((h2) => (
                    <div key={h2.id} className="space-y-0.5">
                      <p className="text-sm truncate">{h2.text}</p>
                      {h2.children.map((h3) => (
                        <p
                          key={h3.id}
                          className="text-xs text-muted-foreground pl-3 truncate"
                        >
                          {h3.text}
                        </p>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main: Content */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Generated Content</CardTitle>
                    <CardDescription>
                      AI-generated article based on your outline
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      <span className="font-mono font-semibold">
                        {wordCount.toLocaleString()}
                      </span>{" "}
                      words
                    </span>
                    {isGeneratingContent && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                    {generatedContent || (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Regenerate per section */}
              {!isGeneratingContent && generatedContent && (
                <div className="space-y-2">
                  {outline.map((h2) => (
                    <div
                      key={h2.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-sm font-medium">{h2.text}</span>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Regenerate
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!isGeneratingContent && generatedContent && (
                <Button
                  className="w-full"
                  onClick={() => setCurrentStep("step-3")}
                >
                  Next: Meta & Title
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Step 3: Meta & Title */}
        <TabsContent value="step-3" className="space-y-6">
          {/* Meta Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Meta Description Candidates</CardTitle>
              <CardDescription>
                Select the best meta description for your article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockMetaCandidates.map((meta) => (
                <label
                  key={meta.id}
                  className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedMeta === meta.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="meta"
                      value={meta.id}
                      checked={selectedMeta === meta.id}
                      onChange={() => setSelectedMeta(meta.id)}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm">{meta.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground font-mono">
                        {meta.text.length} characters
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Title Candidates */}
          <Card>
            <CardHeader>
              <CardTitle>Title Candidates</CardTitle>
              <CardDescription>
                Choose the most compelling title
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTitleCandidates.map((title) => (
                <label
                  key={title.id}
                  className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedTitle === title.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="title"
                      value={title.id}
                      checked={selectedTitle === title.id}
                      onChange={() => setSelectedTitle(title.id)}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{title.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground font-mono">
                        {title.text.length} characters
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={() => setCurrentStep("step-4")}
            disabled={!selectedMeta || !selectedTitle}
          >
            Next: Preview
          </Button>
        </TabsContent>

        {/* Step 4: Preview */}
        <TabsContent value="step-4" className="space-y-6">
          {/* SEO Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Checklist</CardTitle>
              <CardDescription>
                Verify your article meets SEO requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {seoChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <span className="text-sm">{check.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Article Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Article Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <article className="mx-auto max-w-2xl space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {selectedTitle
                    ? mockTitleCandidates.find((t) => t.id === selectedTitle)
                        ?.text
                    : h1Title}
                </h1>
                {selectedMeta && (
                  <p className="text-sm italic text-muted-foreground border-l-2 border-muted pl-3">
                    {
                      mockMetaCandidates.find((m) => m.id === selectedMeta)
                        ?.text
                    }
                  </p>
                )}
                <Separator />
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                  {generatedContent}
                </div>
              </article>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              Mark as Review
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Inline Skeleton for step 2 content loading
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  );
}
