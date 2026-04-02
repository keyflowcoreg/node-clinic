import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

export function Footer() {
  return (
    <footer className="bg-graphite text-ivory py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <ScrollReveal delay={0} className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-ivory flex items-center justify-center sharp-edge">
                <div className="w-3 h-3 bg-graphite sharp-edge" />
              </div>
              <span className="font-display font-semibold text-xl tracking-tight uppercase">
                Node Clinic
              </span>
            </Link>
            <p className="text-silver text-sm max-w-sm leading-relaxed">
              Lusso medico architettonico. Selezioniamo le migliori cliniche e professionisti, garantendo un'esperienza di prenotazione fluida, trasparente e premium.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h4 className="font-display uppercase tracking-widest text-xs text-silver mb-6">Esplora</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/search" className="hover:text-silver transition-colors relative group">
                  Trattamenti
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-silver transition-colors relative group">
                  Cliniche
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-silver transition-colors relative group">
                  La Nostra Visione
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-silver transition-colors relative group">
                  Journal
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h4 className="font-display uppercase tracking-widest text-xs text-silver mb-6">Legale</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/terms" className="hover:text-silver transition-colors relative group">
                  Termini di Servizio
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-silver transition-colors relative group">
                  Privacy Policy
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-silver transition-colors relative group">
                  Cookie Policy
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-silver transition-colors relative group">
                  Contattaci
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ivory/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
            </ul>
          </ScrollReveal>
        </div>

        <div className="mt-16 pt-8 border-t border-silver/20 flex flex-col md:flex-row justify-between items-center text-xs text-silver">
          <p>&copy; {new Date().getFullYear()} Node Clinic. Tutti i diritti riservati.</p>
          <p className="mt-4 md:mt-0">
            La prestazione è della clinica partner, la piattaforma facilita informazione e prenotazione.
          </p>
        </div>
      </div>
    </footer>
  );
}
