import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type LandingLayoutProps = {
  children: ReactNode;
  stickyCta?: {
    text: string;
    onClick: () => void;
  };
};

export function LandingLayout({ children, stickyCta }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Minimal Top Bar */}
      <header className="bg-ivory border-b border-silver/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-graphite flex items-center justify-center sharp-edge">
                <div className="w-2.5 h-2.5 bg-ivory sharp-edge" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight uppercase">
                Node Clinic
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-graphite text-ivory py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="text-xs text-silver">
              &copy; {new Date().getFullYear()} Node Clinic. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-6 text-xs text-silver">
              <Link
                to="/privacy"
                className="hover:text-ivory transition-colors uppercase tracking-widest"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-ivory transition-colors uppercase tracking-widest"
              >
                Termini
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-silver/20">
            <p className="text-[11px] text-silver/60 leading-relaxed max-w-3xl">
              Le informazioni presenti non sostituiscono in alcun modo la valutazione clinica di un medico specialista.
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      {stickyCta && (
        <div className={cn(
          'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
          'bg-graphite border-t border-silver/20 px-4 py-3',
          'safe-area-inset-bottom'
        )}>
          <button
            onClick={stickyCta.onClick}
            className="w-full bg-ivory text-graphite py-3.5 font-medium text-sm uppercase tracking-widest sharp-edge hover:bg-ivory-dark transition-colors active:scale-[0.98]"
          >
            {stickyCta.text}
          </button>
        </div>
      )}
    </div>
  );
}
