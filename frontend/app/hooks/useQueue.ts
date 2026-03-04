"use client";

import { useState, useCallback } from "react";
import { QueueItem, API_BASE } from "../types";

let nextId = 1;

function isPlaylistUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // youtube.com/playlist?list=... or any URL with list= param (but not single video with list= + v=)
    if (parsed.hostname.includes("youtube.com") && parsed.pathname === "/playlist") return true;
    // URL has list= but no v= → it's a pure playlist link
    if (parsed.searchParams.has("list") && !parsed.searchParams.has("v")) return true;
  } catch {
    // not a valid URL
  }
  return false;
}

export function useQueue(
  showStatus: (type: "loading" | "error" | "success", text: string, duration?: number) => void,
  fetchFiles: () => Promise<void>,
) {
  const [url, setUrl] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const fetchVideoInfo = useCallback(async (itemId: string, videoUrl: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === itemId ? { ...q, status: "loading-info" as const } : q))
    );
    try {
      const res = await fetch(`${API_BASE}/api/video-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to fetch info");
      }
      const data = await res.json();
      setQueue((prev) =>
        prev.map((q) => (q.id === itemId ? { ...q, info: data, status: "ready" as const } : q))
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId ? { ...q, status: "error" as const, error: msg } : q
        )
      );
    }
  }, []);

  const expandPlaylist = useCallback(async (playlistUrl: string) => {
    showStatus("loading", "⏳ Pobieranie listy odtwarzania...", 0);
    try {
      const res = await fetch(`${API_BASE}/api/playlist-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: playlistUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to fetch playlist");
      }
      const data: { playlist_title: string; entries: { url: string; title: string }[] } = await res.json();

      const newItems: QueueItem[] = data.entries.map((entry) => ({
        id: String(nextId++),
        url: entry.url,
        info: null,
        status: "pending" as const,
      }));

      setQueue((prev) => [...prev, ...newItems]);
      showStatus("success", `✅ Dodano ${newItems.length} utworów z playlisty „${data.playlist_title}"`);

      for (const item of newItems) {
        fetchVideoInfo(item.id, item.url);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Błąd";
      showStatus("error", `❌ Nie można pobrać playlisty: ${msg}`);
    }
  }, [showStatus, fetchVideoInfo]);

  const addToQueue = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const urls = trimmed
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    setUrl("");

    const playlistUrls = urls.filter(isPlaylistUrl);
    const singleUrls = urls.filter((u) => !isPlaylistUrl(u));

    // Handle playlists
    for (const pUrl of playlistUrls) {
      expandPlaylist(pUrl);
    }

    // Handle single videos
    if (singleUrls.length > 0) {
      const newItems: QueueItem[] = singleUrls.map((u) => ({
        id: String(nextId++),
        url: u,
        info: null,
        status: "pending" as const,
      }));

      setQueue((prev) => [...prev, ...newItems]);

      for (const item of newItems) {
        fetchVideoInfo(item.id, item.url);
      }
    }
  }, [url, fetchVideoInfo, expandPlaylist]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const downloadSingle = useCallback(async (item: QueueItem) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "downloading" as const } : q))
    );
    try {
      const res = await fetch(`${API_BASE}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: item.url }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Download failed");
      }
      const data = await res.json();
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: "done" as const, result: { filename: data.filename, size_mb: data.size_mb } }
            : q
        )
      );
      fetchFiles();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Download error";
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "error" as const, error: msg } : q
        )
      );
    }
  }, [fetchFiles]);

  const downloadAll = useCallback(async () => {
    const readyItems = queue.filter((q) => q.status === "ready");
    if (readyItems.length === 0) return;
    setIsDownloadingAll(true);
    showStatus("loading", `⏬ Pobieranie ${readyItems.length} plików...`, 0);

    for (const item of readyItems) {
      await downloadSingle(item);
    }

    setIsDownloadingAll(false);
    showStatus("success", "✅ Zakończono pobieranie!");
    fetchFiles();
  }, [queue, showStatus, downloadSingle, fetchFiles]);

  const clearDone = useCallback(() => {
    setQueue((prev) => prev.filter((q) => q.status !== "done"));
  }, []);

  const readyCount = queue.filter((q) => q.status === "ready").length;
  const doneCount = queue.filter((q) => q.status === "done").length;

  return {
    url,
    setUrl,
    queue,
    isDownloadingAll,
    readyCount,
    doneCount,
    addToQueue,
    removeFromQueue,
    downloadSingle,
    downloadAll,
    clearDone,
  };
}

