"use client";

import { Box, Typography, Button, Chip, CircularProgress, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { QueueItem as QueueItemType } from "../types";
import QueueItemCard from "./QueueItem";

interface QueueSectionProps {
  queue: QueueItemType[];
  readyCount: number;
  doneCount: number;
  isDownloadingAll: boolean;
  onClearDone: () => void;
  onDownload: (item: QueueItemType) => void;
  onRemove: (id: string) => void;
  onDownloadAll: () => void;
}

export default function QueueSection({
  queue,
  readyCount,
  doneCount,
  isDownloadingAll,
  onClearDone,
  onDownload,
  onRemove,
  onDownloadAll,
}: QueueSectionProps) {
  if (queue.length === 0) return null;

  return (
    <Box component="section" sx={{ mb: 5 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          📋 Kolejka pobierania
          <Chip
            label={queue.length}
            size="small"
            sx={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 22,
            }}
          />
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {doneCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={onClearDone}
              startIcon={<CleaningServicesIcon />}
              sx={{ borderColor: "rgba(255,255,255,0.08)", color: "text.primary", fontSize: "0.82rem" }}
            >
              Wyczyść ukończone
            </Button>
          )}
        </Stack>
      </Box>

      {/* Queue Items */}
      <Stack spacing={1.5}>
        {queue.map((item) => (
          <QueueItemCard
            key={item.id}
            item={item}
            onDownload={onDownload}
            onRemove={onRemove}
          />
        ))}
      </Stack>

      {/* Download All */}
      {readyCount > 0 && (
        <Box sx={{ mt: 2.5, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={onDownloadAll}
            disabled={isDownloadingAll}
            startIcon={isDownloadingAll ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
            sx={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              px: 5,
              py: 1.5,
              fontSize: "1.05rem",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 30px rgba(124, 58, 237, 0.45)",
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              },
              "&:disabled": {
                opacity: 0.6,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              },
            }}
          >
            {isDownloadingAll ? "Pobieranie..." : `Pobierz wszystkie (${readyCount})`}
          </Button>
        </Box>
      )}
    </Box>
  );
}
