"use client";

import { Box, TextField, Button, ToggleButtonGroup, ToggleButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import VideocamIcon from "@mui/icons-material/Videocam";

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAdd: () => void;
  format: "mp3" | "mp4";
  onFormatChange: (format: "mp3" | "mp4") => void;
}

export default function UrlInput({ url, setUrl, onAdd, format, onFormatChange }: UrlInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Format selector */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          Format:
        </Typography>
        <ToggleButtonGroup
          value={format}
          exclusive
          onChange={(_, val) => { if (val) onFormatChange(val); }}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "text.secondary",
              borderColor: "rgba(255,255,255,0.12)",
              px: 2,
              py: 0.5,
              fontSize: "0.82rem",
              fontWeight: 600,
              gap: 0.5,
              "&.Mui-selected": {
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                color: "white",
                borderColor: "transparent",
                "&:hover": {
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                },
              },
            },
          }}
        >
          <ToggleButton value="mp3">
            <AudiotrackIcon sx={{ fontSize: 16 }} />
            MP3
          </ToggleButton>
          <ToggleButton value="mp4">
            <VideocamIcon sx={{ fontSize: 16 }} />
            MP4
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* URL input + Add button */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <TextField
          id="url-input"
          multiline
          rows={2}
          placeholder="Wklej linki do YouTube lub playlisty (każdy w nowej linii lub oddzielone przecinkiem)..."
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
    </Box>
  );
}
