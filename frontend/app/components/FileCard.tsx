"use client";

import { Card, CardContent, Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { FileItem, API_BASE } from "../types";

interface FileCardProps {
  file: FileItem;
  onDelete: (filename: string) => void;
}

export default function FileCard({ file, onDelete }: FileCardProps) {
  return (
    <Card
      sx={{
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.15)",
          bgcolor: "rgba(255, 255, 255, 0.07)",
          transform: "translateX(4px)",
        },
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, "&:last-child": { pb: 2 } }}>
        {/* Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            flexShrink: 0,
            background: file.is_mp3
              ? "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(245, 158, 11, 0.2))"
              : "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(124, 58, 237, 0.2))",
          }}
        >
          {file.is_mp3 ? "🎵" : "🎬"}
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {file.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {file.size_mb} MB • {file.is_mp3 ? "MP3" : "MP4"}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center" }}>
          <IconButton
            component="a"
            href={`${API_BASE}/api/files/${encodeURIComponent(file.filename)}`}
            download
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <SaveAltIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={() => onDelete(file.filename)} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
