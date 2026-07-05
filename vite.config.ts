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
    target: "es2020",
    chunkSizeWarningLimit: 600,
    modulePreload: {
      resolveDependencies(_filename, deps) {
        return deps.filter(
          (dep) =>
            !dep.includes("/admin/") &&
            !dep.includes("/courier/") &&
            !dep.includes("charts") &&
            !dep.includes("maps") &&
            !dep.includes("qr")
        )
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/src/i18n/locales/")) {
            const match = id.match(/locales\/([a-z]+)\.json/)
            if (match && match[1] !== "de") return `locale-${match[1]}`
          }
          if (!id.includes("node_modules")) return;
          if (id.includes("chart.js") || id.includes("react-chartjs-2")) return "charts";
          if (id.includes("leaflet")) return "maps";
          if (id.includes("socket.io-client")) return "socket";
          if (id.includes("react-qr-scanner")) return "qr";
          if (id.includes("@stripe/")) return "stripe";
          if (id.includes("@paypal/")) return "paypal";
          if (id.includes("@capacitor/")) return "capacitor";
          if (id.includes("i18next") || id.includes("react-i18next")) return "i18n";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("react-router")) return "router";
          if (id.includes("axios")) return "http";
          if (id.includes("zustand")) return "state";
          if (id.includes("react-dom") || id.includes("react/")) return "react";
        }
      }
    }
  }
});
