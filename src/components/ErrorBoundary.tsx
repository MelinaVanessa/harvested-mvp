import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error: error instanceof Error ? error : new Error(String(error)) }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      const msg = this.state.error.message || String(this.state.error)
      return (
        <div className="p-6 bg-red-50 text-red-800 rounded-lg text-sm">
          <p className="font-bold">Etwas ist schiefgelaufen</p>
          <p className="mt-2 break-all">{msg}</p>
        </div>
      )
    }
    return this.props.children
  }
}
