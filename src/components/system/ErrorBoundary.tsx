import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive-soft text-destructive flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">משהו השתבש</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            התרחשה תקלה לא צפויה. ניתן לרענן את הדף, או לחזור לעמוד הראשי. הצוות הטכני יקבל דיווח.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-[11px] text-destructive bg-destructive-soft/60 rounded-lg p-3 mb-4 overflow-auto text-right max-h-32" dir="ltr">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> נסה שוב
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-4 h-10 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              <Home className="w-4 h-4" /> לעמוד הראשי
            </a>
          </div>
        </div>
      </div>
    );
  }
}
