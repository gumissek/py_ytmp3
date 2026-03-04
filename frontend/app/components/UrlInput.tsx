"use client";

import { Box, TextField, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAdd: () => void;
}

export default function UrlInput({ url, setUrl, onAdd }: UrlInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 4 }}>
      <TextField
        id="url-input"
        multiline
        rows={2}
        placeholder="Wklej linki do YouTube (każdy w nowej linii lub oddzielone przecinkiem)..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
        sx={{
          "& .MuiInputBase-input::placeholder": {
            color: "#5a5a7a",
            opacity: 1,
          },
        }}
      />
      <Button
        id="add-btn"
        variant="contained"
        onClick={onAdd}
        disabled={!url.trim()}
        startIcon={<AddIcon />}
        sx={{
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          px: 4,
          minWidth: "auto",
          alignSelf: "stretch",
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 30px rgba(124, 58, 237, 0.45)",
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          },
          "&:disabled": {
            opacity: 0.5,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          },
        }}
      >
        Dodaj
      </Button>
    </Box>
  );
}
