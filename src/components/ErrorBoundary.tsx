/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export class ErrorBoundary extends React.Component<
  { children?: React.ReactNode },
  { hasError: boolean; error?: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] error", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Ocorreu um erro ao carregar a página</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#b00" }}>
            {String(this.state.error)}
          </pre>
          <p>Abra o console para ver o stacktrace.</p>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}
