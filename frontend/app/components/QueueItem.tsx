"use client";

import { Card, CardContent, Box, Typography, IconButton, CircularProgress, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { QueueItem as QueueItemType, formatDuration, formatViews } from "../types";

interface QueueItemProps {
  item: QueueItemType;
  onDownload: (item: QueueItemType) => void;
  onRemove: (id: string) => void;
}

const statusBorderColors: Record<string, string> = {
  done: "rgba(16, 185, 129, 0.2)",
  error: "rgba(239, 68, 68, 0.2)",
  downloading: "rgba(124, 58, 237, 0.3)",
};

const statusBgColors: Record<string, string> = {
  done: "rgba(16, 185, 129, 0.03)",
  error: "rgba(239, 68, 68, 0.03)",
};

export default function QueueItemCard({ item, onDownload, onRemove }: QueueItemProps) {
  return (
    <Card
      sx={{
        borderColor: statusBorderColors[item.status] || "rgba(255, 255, 255, 0.08)",
        bgcolor: statusBgColors[item.status] || "rgba(255, 255, 255, 0.04)",
        boxShadow: item.status === "downloading" ? "0 0 20px rgba(124, 58, 237, 0.1)" : "none",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.15)",
          bgcolor: "rgba(255, 255, 255, 0.07)",
          transform: "translateX(4px)",
        },
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, "&:last-child": { pb: 2 } }}>
        {/* Thumbnail */}
        {item.info && (
          <Box
            sx={{
              width: 100,
              minWidth: 100,
              aspectRatio: "16/9",
              borderRadius: 1,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={item.info.thumbnail_url}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </Box>
        )}

        {/* Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {item.status === "loading-info" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Ładowanie info...</Typography>
            </Box>
          )}
          {item.info && (
            <>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {item.info.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {item.info.author} • {formatDuration(item.info.length)} • 👁 {formatViews(item.info.views)}
              </Typography>
            </>
          )}
          {item.status === "error" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />
              <Typography variant="body2" sx={{ color: "error.main" }}>
                {item.error || item.url}
              </Typography>
            </Box>
          )}
          {item.status === "done" && item.result && (
            <Typography variant="caption" sx={{ color: "success.main" }}>
              ✅ Pobrano ({item.result.size_mb} MB)
            </Typography>
          )}
          {item.status === "downloading" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: "primary.main" }} />
              <Typography variant="caption" sx={{ color: "primary.main" }}>Pobieranie...</Typography>
            </Box>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center" }}>
          <Chip
            label={item.format === "mp4" ? "🎬 MP4" : "🎵 MP3"}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: item.format === "mp4" ? "rgba(6, 182, 212, 0.15)" : "rgba(236, 72, 153, 0.15)",
              color: item.format === "mp4" ? "#06b6d4" : "#ec4899",
              border: `1px solid ${item.format === "mp4" ? "rgba(6, 182, 212, 0.3)" : "rgba(236, 72, 153, 0.3)"}`,
            }}
          />

          {item.status === "ready" && (
            <IconButton size="small" onClick={() => onDownload(item)} sx={{ color: "primary.main" }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          )}

          {item.status === "done" && (
            <CheckCircleIcon sx={{ fontSize: 20, color: "success.main" }} />
          )}

          {item.status !== "downloading" && (
            <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: "error.main" }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
