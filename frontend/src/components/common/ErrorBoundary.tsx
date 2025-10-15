import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { BrainOrb } from './BrainOrb';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center space-y-6 p-8 max-w-md">
            <BrainOrb size="M" variant="Idle" theme="Light" />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Bir şeyler yanlış gitti
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Üzgünüz, beklenmeyen bir hata oluştu. Sayfayı yenilemeyi deneyin veya daha sonra tekrar gelin.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-50 p-4 rounded-lg border border-red-200">
                  <summary className="cursor-pointer text-red-700 font-medium">
                    Hata detayları (geliştirici modu)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Sayfayı Yenile
                </Button>
                <Button
                  onClick={() => this.setState({ hasError: false })}
                  variant="outline"
                >
                  Tekrar Dene
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}