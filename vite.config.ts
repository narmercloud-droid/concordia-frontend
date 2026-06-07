import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("chart.js") || id.includes("react-chartjs-2")) return "charts";
          if (id.includes("socket.io-client")) return "socket";
          if (id.includes("react-qr-scanner")) return "qr";
          if (id.includes("i18next") || id.includes("react-i18next")) return "i18n";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("react-router")) return "router";
          if (id.includes("react-dom") || id.includes("react/")) return "react";
        }
      }
    }
  }
});
