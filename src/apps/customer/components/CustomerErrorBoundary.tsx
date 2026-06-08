import React from "react"
import i18n from "@/i18n"

type Props = {
  children: React.ReactNode
  resetKey?: string
}

type State = {
  hasError: boolean
}

export default class CustomerErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  componentDidCatch(error: unknown) {
    console.error("Customer page error:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="customer-page" style={{ padding: 32, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--c-serif)", marginBottom: 12 }}>
            {i18n.t("common.errorTitle")}
          </h2>
          <p style={{ color: "var(--c-muted)", marginBottom: 20 }}>{i18n.t("common.errorBody")}</p>
          <button
            type="button"
            className="home-cta"
            onClick={() => {
              this.setState({ hasError: false })
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
