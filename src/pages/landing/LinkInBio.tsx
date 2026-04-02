import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ExternalLink, Instagram, Music2, MessageCircle } from 'lucide-react';
import { LandingLayout } from '../../components/layout/LandingLayout';
import { store } from '../../services/store';

type LinkItem = {
  label: string;
  url: string;
  external: boolean;
};

const LINKS: LinkItem[] = [
  { label: 'Prenota una visita', url: '/lp/prenota-visita?utm_source=bio', external: false },
  { label: 'Scopri i trattamenti', url: '/lp/trattamenti?utm_source=bio', external: false },
  { label: 'Le nostre cliniche', url: '/search?utm_source=bio', external: false },
  { label: 'Diventa Partner', url: '/lp/diventa-partner?utm_source=bio', external: false },
  { label: 'Contattaci', url: '/contact?utm_source=bio', external: false },
  { label: 'Chi siamo', url: '/about?utm_source=bio', external: false },
  { label: 'Instagram', url: 'https://instagram.com/nodeclinic', external: true },
  { label: 'TikTok', url: 'https://tiktok.com/@nodeclinic', external: true },
  {
    label: 'WhatsApp',
    url: 'https://wa.me/393401234567?text=Ciao,%20vorrei%20informazioni',
    external: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as number[] },
  },
};

function trackClick(url: string) {
  store.funnel.track({ funnel: 'bio', step: 'link_click', page: url });
}

export function LinkInBio() {
  return (
    <LandingLayout>
      <div className="bg-ivory min-h-[80vh] py-12 px-4">
        <div className="max-w-md mx-auto flex flex-col items-center">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center mb-10"
          >
            {/* Logo square — mirrors LandingLayout header logo */}
            <div className="w-16 h-16 bg-graphite flex items-center justify-center sharp-edge mb-4">
              <div className="w-6 h-6 bg-ivory sharp-edge" />
            </div>

            <h1 className="font-display font-semibold text-2xl tracking-tight uppercase text-graphite mb-1">
              Node Clinic
            </h1>
            <p className="text-sm text-graphite/60 font-light text-center leading-relaxed">
              La piattaforma italiana per la medicina estetica
            </p>
          </motion.div>

          {/* Link Buttons */}
          <motion.div
            className="w-full flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {LINKS.map((link) =>
              link.external ? (
                <motion.a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick(link.url)}
                  variants={itemVariants}
                  className="w-full py-4 px-6 bg-white border border-silver/30 sharp-edge text-graphite font-medium text-sm uppercase tracking-wider hover:border-graphite hover:shadow-md transition-all flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 text-graphite/50" strokeWidth={1.5} />
                </motion.a>
              ) : (
                <motion.div key={link.url} variants={itemVariants}>
                  <Link
                    to={link.url}
                    onClick={() => trackClick(link.url)}
                    className="w-full py-4 px-6 bg-white border border-silver/30 sharp-edge text-graphite font-medium text-sm uppercase tracking-wider hover:border-graphite hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              )
            )}
          </motion.div>

          {/* Social Icons Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-6 mt-10"
          >
            <a
              href="https://instagram.com/nodeclinic"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('https://instagram.com/nodeclinic')}
              aria-label="Instagram"
              className="text-graphite/40 hover:text-graphite transition-colors"
            >
              <Instagram className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://tiktok.com/@nodeclinic"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('https://tiktok.com/@nodeclinic')}
              aria-label="TikTok"
              className="text-graphite/40 hover:text-graphite transition-colors"
            >
              <Music2 className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://wa.me/393401234567?text=Ciao,%20vorrei%20informazioni"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackClick('https://wa.me/393401234567?text=Ciao,%20vorrei%20informazioni')
              }
              aria-label="WhatsApp"
              className="text-graphite/40 hover:text-graphite transition-colors"
            >
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            </a>
          </motion.div>
        </div>
      </div>
    </LandingLayout>
  );
}
