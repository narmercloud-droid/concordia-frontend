import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import queryClient from "./lib/queryClient.js"
import router from "./router/rootRouter.js"
import { warmupApi } from "./api/warmup.js"
import { bootstrapI18n } from "./i18n/index.js"
import { hydrateCustomerQueries } from "./lib/hydrateCustomerQueries.js"
import { initNativeApp } from "./lib/initNativeApp.js"
import { inject } from "@vercel/analytics"

async function startApp() {
  try {
    hydrateCustomerQueries(queryClient)
    void warmupApi()
    void initNativeApp()
    inject()
    await bootstrapI18n()

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>
    )
  } catch (err) {
    console.error("App bootstrap failed:", err)
    const root = document.getElementById("root")
    if (root) {
      root.innerHTML =
        '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:48px auto;padding:0 20px;color:#1a1a1a">' +
        "<h1 style=\"font-size:1.25rem\">Concordia konnte nicht geladen werden</h1>" +
        "<p>Bitte Seite neu laden. Falls das Problem bleibt, Cache leeren (Strg+Umschalt+R).</p>" +
        "</div>"
    }
  }
}

void startApp()
