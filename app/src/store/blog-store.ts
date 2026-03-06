import { create } from "zustand";

interface BlogState {
  currentBlogId: string | null;
  currentBlogType: "marketing" | "beauty";
  setCurrentBlog: (id: string, type: "marketing" | "beauty") => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  currentBlogId: null,
  currentBlogType: "marketing",
  setCurrentBlog: (id, type) =>
    set({ currentBlogId: id, currentBlogType: type }),
}));
