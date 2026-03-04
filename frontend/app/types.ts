export interface VideoInfo {
  title: string;
  author: string;
  length: number;
  thumbnail_url: string;
  views: number;
}

export interface QueueItem {
  id: string;
  url: string;
  info: VideoInfo | null;
  status: "pending" | "loading-info" | "ready" | "downloading" | "done" | "error";
  error?: string;
  result?: { filename: string; size_mb: number };
}

export interface FileItem {
  filename: string;
  title: string;
  size_mb: number;
  is_mp3: boolean;
}

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return String(views);
}
