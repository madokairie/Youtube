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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Globe,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  BarChart3,
} from "lucide-react";
import { useBlogStore } from "@/store/blog-store";

interface KpiCard {
  label: string;
  value: number;
  trend: number;
  icon: React.ReactNode;
}

type ArticleStatus = "draft" | "outline" | "generating" | "review" | "published";

interface RecentArticle {
  id: string;
  title: string;
  status: ArticleStatus;
  seoScore: number;
  keyword: string;
  date: string;
}

const statusConfig: Record<
  ArticleStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  outline: {
    label: "Outline",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  generating: {
    label: "Generating",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  review: {
    label: "Review",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  published: {
    label: "Published",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
};

const mockKpis: KpiCard[] = [
  {
    label: "Total Articles",
    value: 47,
    trend: 12.5,
    icon: <FileText className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Published",
    value: 32,
    trend: 8.3,
    icon: <Globe className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Avg SEO Score",
    value: 84,
    trend: 3.2,
    icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Pending Actions",
    value: 5,
    trend: -16.7,
    icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
  },
];

const mockArticles: RecentArticle[] = [
  {
    id: "1",
    title: "SEO Best Practices for 2026",
    status: "published",
    seoScore: 92,
    keyword: "SEO best practices",
    date: "2026-03-05",
  },
  {
    id: "2",
    title: "Content Marketing Strategy Guide",
    status: "review",
    seoScore: 78,
    keyword: "content marketing strategy",
    date: "2026-03-04",
  },
  {
    id: "3",
    title: "How to Build Backlinks Effectively",
    status: "generating",
    seoScore: 0,
    keyword: "build backlinks",
    date: "2026-03-03",
  },
  {
    id: "4",
    title: "Technical SEO Audit Checklist",
    status: "outline",
    seoScore: 0,
    keyword: "technical SEO audit",
    date: "2026-03-02",
  },
  {
    id: "5",
    title: "Keyword Research for Beginners",
    status: "draft",
    seoScore: 65,
    keyword: "keyword research",
    date: "2026-03-01",
  },
];

export default function DashboardPage() {
  const { currentBlogType } = useBlogStore();
  const [kpis] = useState<KpiCard[]>(mockKpis);
  const [articles] = useState<RecentArticle[]>(mockArticles);

  const accentColor =
    currentBlogType === "marketing" ? "text-blue-600" : "text-rose-600";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your content performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium">
                {kpi.label}
              </CardDescription>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{kpi.value}</div>
              <Badge
                className={
                  kpi.trend >= 0
                    ? "mt-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "mt-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }
              >
                {kpi.trend >= 0 ? "+" : ""}
                {kpi.trend}%
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Articles</CardTitle>
          <CardDescription>Your latest content across all stages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">SEO Score</TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    <Badge
                      className={statusConfig[article.status].className}
                    >
                      {statusConfig[article.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {article.seoScore > 0 ? article.seoScore : "--"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {article.keyword}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono">
                    {article.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button className={accentColor}>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Analyze Competitors
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Check Rankings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
