// src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado en la UI:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="ticket max-w-sm w-full text-center space-y-3 p-6">
            <AlertTriangle className="w-8 h-8 mx-auto text-accent" />
            <h1 className="font-display text-lg font-semibold">
              Algo se rompió de este lado
            </h1>
            <p className="text-sm text-muted-foreground">
              Recargá la página. Tu historial guardado no se pierde, queda en
              este navegador.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
