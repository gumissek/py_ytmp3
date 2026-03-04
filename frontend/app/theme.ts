"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7c3aed",
      light: "#a78bfa",
      dark: "#5b21b6",
    },
    secondary: {
      main: "#06b6d4",
      light: "#22d3ee",
      dark: "#0891b2",
    },
    error: {
      main: "#ef4444",
    },
    success: {
      main: "#10b981",
    },
    warning: {
      main: "#f59e0b",
    },
    background: {
      default: "#0a0a1a",
      paper: "rgba(255, 255, 255, 0.04)",
    },
    text: {
      primary: "#f0f0f5",
      secondary: "#8888a8",
      disabled: "#5a5a7a",
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 16,
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.08)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.15)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#7c3aed",
              boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.15), 0 0 40px rgba(124, 58, 237, 0.15)",
            },
          },
        },
      },
    },
  },
});

export default theme;
