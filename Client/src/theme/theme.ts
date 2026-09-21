// src/theme/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4F46E5", // Indigo AI
      dark: "#4338CA", // Primary Hover
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#8B5CF6", // Purple AI
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#06B6D4", // AI Glow (Cyan)
    },
    success: {
      main: "#22C55E",
    },
    warning: {
      main: "#F59E0B",
    },
    error: {
      main: "#EF4444",
    },
    background: {
      default: "#F8FAFC", // Background
      paper: "#FFFFFF", // Surface / Card
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
      disabled: "#94A3B8", // Muted
    },
    divider: "#E2E8F0", // Border
  },
  typography: {
    // استفاده از متغیر فونت لود شده توسط Next.js
    fontFamily: 'var(--font-vazirmatn), "Segoe UI", Roboto, sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'var(--font-vazirmatn), "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderColor: "#E2E8F0",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: "#CBD5E1",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
  },
});

export default theme;
