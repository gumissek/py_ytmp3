"use client";

import { useState, useCallback } from "react";

interface StatusMessage {
  type: "loading" | "error" | "success";
  text: string;
}

export function useStatus() {
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const showStatus = useCallback((type: StatusMessage["type"], text: string, duration = 4000) => {
    setStatusMessage({ type, text });
    if (duration > 0) {
      setTimeout(() => setStatusMessage(null), duration);
    }
  }, []);

  const clearStatus = useCallback(() => setStatusMessage(null), []);

  return { statusMessage, showStatus, clearStatus };
}
