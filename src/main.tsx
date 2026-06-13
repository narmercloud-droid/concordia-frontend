import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { SpeedInsights } from "@vercel/speed-insights/react"
import queryClient from "./lib/queryClient.js"
import router from "./router/rootRouter.js"
import { warmupApi } from "./api/warmup.js"
import { bootstrapI18n } from "./i18n/index.js"
import { hydrateCustomerQueries } from "./lib/hydrateCustomerQueries.js"

async function startApp() {
  hydrateCustomerQueries(queryClient)
  void warmupApi()
  await bootstrapI18n()

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <SpeedInsights />
      </QueryClientProvider>
    </React.StrictMode>
  )
}

void startApp()
