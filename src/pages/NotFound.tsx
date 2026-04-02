import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-ivory">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center"
      >
        <span className="font-display text-8xl font-light text-silver/50 leading-none mb-6 select-none">
          404
        </span>

        <h1 className="font-display text-2xl font-medium text-graphite mb-3 tracking-tight">
          Pagina non trovata
        </h1>

        <p className="text-sm text-graphite/60 font-light leading-relaxed mb-10 max-w-sm">
          La pagina che stai cercando non esiste o e&apos; stata spostata.
        </p>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-graphite text-ivory px-6 py-3 sharp-edge text-sm font-medium uppercase tracking-widest hover:bg-graphite/90 transition-colors"
          >
            <Home className="w-4 h-4" strokeWidth={1.5} />
            Torna alla Home
          </Link>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 border border-silver/30 text-graphite px-6 py-3 sharp-edge text-sm font-medium uppercase tracking-widest hover:border-graphite hover:shadow-sm transition-all"
          >
            <Search className="w-4 h-4" strokeWidth={1.5} />
            Cerca una Clinica
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
