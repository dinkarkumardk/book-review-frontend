import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('ErrorBoundary caught', error, info); }
  reset = () => this.setState({ hasError: false, error: undefined });
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-sm">An unexpected error occurred. You can try refreshing or returning home.</p>
          <div className="flex gap-3">
            <button onClick={this.reset} className="px-3 py-1.5 rounded-md border text-sm">Try Again</button>
            <a href="/" className="px-3 py-1.5 rounded-md bg-sky-600 text-white text-sm">Home</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
