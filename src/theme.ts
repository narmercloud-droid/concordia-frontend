export const theme = {
  colors: {
    primary: "#4caf50",
    secondary: "#1976d2",
    danger: "#d32f2f",
    background: "#ffffff",
    surface: "#f7f7f7",
    text: "#222222",
    muted: "#777777",
  },

  spacing: (value: number) => `${value * 8}px`,

  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },

  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.1)",
    md: "0 2px 6px rgba(0,0,0,0.15)",
  },
};
