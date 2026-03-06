"use client";

import { useCallback } from "react";
import { ChevronDown, Globe, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useBlogStore } from "@/store/blog-store";

const blogs = [
  {
    id: "marketing",
    name: "Marketing Blog",
    type: "marketing" as const,
    color: "#2563eb",
    icon: Globe,
  },
  {
    id: "beauty",
    name: "Beauty Blog",
    type: "beauty" as const,
    color: "#e11d48",
    icon: Sparkles,
  },
] as const;

export function BlogSwitcher() {
  const { currentBlogType, setCurrentBlog } = useBlogStore();

  const currentBlog = blogs.find((b) => b.type === currentBlogType) ?? blogs[0];

  const handleSwitch = useCallback(
    (blog: (typeof blogs)[number]) => {
      setCurrentBlog(blog.id, blog.type);
      document.documentElement.style.setProperty("--accent", blog.color);
    },
    [setCurrentBlog],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: currentBlog.color }}
          />
          <span className="text-sm font-medium">{currentBlog.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {blogs.map((blog) => {
          const Icon = blog.icon;
          return (
            <DropdownMenuItem
              key={blog.id}
              onClick={() => handleSwitch(blog)}
              className="gap-2"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: blog.color }}
              />
              <Icon className="h-4 w-4" />
              <span>{blog.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
