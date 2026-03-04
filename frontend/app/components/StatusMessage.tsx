"use client";

import { Alert, Fade } from "@mui/material";

interface StatusMessageProps {
  statusMessage: { type: string; text: string } | null;
}

export default function StatusMessage({ statusMessage }: StatusMessageProps) {
  if (!statusMessage) return null;

  const severityMap: Record<string, "info" | "error" | "success"> = {
    loading: "info",
    error: "error",
    success: "success",
  };

  return (
    <Fade in>
      <Alert
        severity={severityMap[statusMessage.type] || "info"}
        variant="outlined"
        sx={{
          mb: 2.5,
          borderRadius: 2.5,
          backdropFilter: "blur(20px)",
          "& .MuiAlert-message": {
            width: "100%",
            textAlign: "center",
          },
        }}
      >
        {statusMessage.text}
      </Alert>
    </Fade>
  );
}
