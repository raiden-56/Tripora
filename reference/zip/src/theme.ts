import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#212121",
        light: "#484848",
        dark: "#000000",
        contrastText: "#fff",
      },
      secondary: {
        main: "#455a64",
        light: "#78909c",
        dark: "#263238",
      },
      background: {
        default: mode === "light" ? "#fafafa" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
      error: { main: "#d32f2f" },
      success: { main: "#388e3c" },
      warning: { main: "#f9a825" },
      info: { main: "#1976d2" },
    },
    typography: {
      fontSize: 13,
      fontFamily: '"Roboto", "Segoe UI", sans-serif',
      h4: { fontSize: "1.5rem", fontWeight: 700 },
      h5: { fontSize: "1.25rem", fontWeight: 600 },
      h6: { fontSize: "1rem", fontWeight: 600 },
      subtitle1: { fontSize: "0.875rem", fontWeight: 500 },
      subtitle2: { fontSize: "0.8125rem", fontWeight: 500 },
      body1: { fontSize: "0.8125rem" },
      body2: { fontSize: "0.75rem" },
      caption: { fontSize: "0.6875rem" },
      button: { fontSize: "0.8125rem" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 600,
            padding: "8px 20px",
          },
          containedPrimary: {
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            "&:hover": {
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light"
                ? "0 1px 3px rgba(0,0,0,0.08)"
                : "0 1px 3px rgba(0,0,0,0.3)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", size: "small" },
      },
    },
  });
