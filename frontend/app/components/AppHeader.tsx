"use client";

import { Box, Typography } from "@mui/material";

export default function AppHeader() {
  return (
    <Box component="header" sx={{ textAlign: "center", mb: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontSize: "2.8rem",
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          mb: 1,
        }}
      >
        ▶ YT Downloader
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", fontSize: "1.05rem" }}>
        Pobieraj filmy z YouTube i konwertuj do MP3
      </Typography>
    </Box>
  );
}
