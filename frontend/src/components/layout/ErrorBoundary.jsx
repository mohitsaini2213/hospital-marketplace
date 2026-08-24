import { Component } from 'react';
import { FaTriangleExclamation, FaArrowRotateRight } from 'react-icons/fa6';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production this would report to a monitoring service.
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-paper)] px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-red-100)] text-[var(--color-red-600)]">
            <FaTriangleExclamation size={24} />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)]">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-ink-soft)]">
            Please try again. If the problem continues, contact us at apimohit0@gmail.com.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-6">
            <FaArrowRotateRight size={13} /> Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
