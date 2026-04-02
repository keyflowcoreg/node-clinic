import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-graphite/10 flex items-center justify-center sharp-edge mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-graphite" />
            </div>
            <h1 className="text-2xl font-display font-light text-graphite mb-3">
              Si e' verificato un errore
            </h1>
            <p className="text-sm text-graphite-light/70 mb-8">
              Qualcosa non ha funzionato. Prova a ricaricare la pagina o torna alla home.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="/"
                className="px-6 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors"
              >
                Torna alla Home
              </a>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-silver/30 text-graphite text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-ivory-dark transition-colors"
              >
                Ricarica
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
