"use client";

import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

export default function EmptyState() {
  return (
    <Box sx={{ textAlign: "center", py: 8, color: "text.disabled" }}>
      <InboxIcon sx={{ fontSize: 56, mb: 2, opacity: 0.5 }} />
      <Typography variant="body1">
        Brak pobranych plików. Wklej linki YouTube powyżej, aby rozpocząć!
      </Typography>
    </Box>
  );
}
