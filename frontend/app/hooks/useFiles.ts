"use client";

import { useState, useCallback } from "react";
import { FileItem, API_BASE } from "../types";

export function useFiles(showStatus: (type: "loading" | "error" | "success", text: string, duration?: number) => void) {
  const [files, setFiles] = useState<FileItem[]>([]);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/videos`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  const handleDelete = useCallback(async (filename: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/delete/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchFiles();
        showStatus("success", `🗑️ Usunięto: ${filename}`);
      }
    } catch {
      showStatus("error", "Nie udało się usunąć pliku");
    }
  }, [showStatus, fetchFiles]);

  return { files, fetchFiles, handleDelete };
}
