import React from "react"

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

export default class CustomerErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error("Customer page error:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="customer-page" style={{ padding: 32, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--c-serif)", marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: "var(--c-muted)", marginBottom: 20 }}>
            Please refresh the page. If the problem continues, try again in a moment.
          </p>
          <button
            type="button"
            className="home-cta"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
