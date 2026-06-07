import React from "react"
import ReactDOM from "react-dom/client"
import "./i18n"
import "./index.css"
import { RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import queryClient from "./lib/queryClient.js"
import router from "./router/rootRouter.js"
import { warmupApi } from "./api/warmup.js"

warmupApi()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
