"use client";

import { Box, Typography, Chip, Stack } from "@mui/material";
import { FileItem } from "../types";
import FileCard from "./FileCard";

interface FileSectionProps {
  title: string;
  icon: string;
  files: FileItem[];
  onDelete: (filename: string) => void;
}

export default function FileSection({ title, icon, files, onDelete }: FileSectionProps) {
  if (files.length === 0) return null;

  return (
    <Box component="section" sx={{ mt: 5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        {icon} {title}
        <Chip
          label={files.length}
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

      <Stack spacing={1.5}>
        {files.map((file) => (
          <FileCard
            key={file.filename}
            file={file}
            onDelete={onDelete}
          />
        ))}
      </Stack>
    </Box>
  );
}
