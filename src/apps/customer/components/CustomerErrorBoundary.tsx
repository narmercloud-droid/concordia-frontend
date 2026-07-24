import React from "react"
import i18n from "@/i18n"

type Props = {
  children: React.ReactNode
  resetKey?: string
}

type State = {
  hasError: boolean
  errorMessage: string
}

const CHUNK_RELOAD_KEY = "concordia:chunk-reload"

function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "")
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("Loading chunk") ||
    message.includes("ChunkLoadError")
  )
}

export default class CustomerErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: "" }

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error ?? "Unknown error")
    return { hasError: true, errorMessage: message }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, errorMessage: "" })
    }
  }

  componentDidCatch(error: unknown) {
    console.error("Customer page error:", error)
    if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1")
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      const chunkError = isChunkLoadError(new Error(this.state.errorMessage))
      return (
        <div className="customer-page" style={{ padding: 32, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--c-serif)", marginBottom: 12 }}>
            {i18n.t("common.errorTitle")}
          </h2>
          <p style={{ color: "var(--c-muted)", marginBottom: 20 }}>{i18n.t("common.errorBody")}</p>
          {import.meta.env.DEV && this.state.errorMessage && !chunkError ? (
            <p
              style={{
                color: "#b45309",
                marginBottom: 20,
                fontSize: "0.85rem",
                wordBreak: "break-word"
              }}
            >
              {this.state.errorMessage}
            </p>
          ) : null}
          <button
            type="button"
            className="home-cta"
            onClick={() => {
              this.setState({ hasError: false, errorMessage: "" })
              window.location.reload()
            }}
          >
            {i18n.t("common.refreshPage")}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
