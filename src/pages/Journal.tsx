import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock } from 'lucide-react';
import { IMAGES } from '../lib/images';

const ARTICLES = [
  {
    id: 'a1',
    title: 'L\'Evoluzione del Bioremodellamento: Oltre i Filler Tradizionali',
    category: 'Approfondimenti Medici',
    date: '8 Marzo 2026',
    readTime: '5 min di lettura',
    image: IMAGES.journal[0],
    excerpt: 'Come trattamenti come Profhilo stanno cambiando il panorama della medicina estetica concentrandosi sulla qualit\u00E0 della pelle piuttosto che sul volume.'
  },
  {
    id: 'a2',
    title: 'Guarigione Architettonica: Perch\u00E9 il Design della Clinica \u00E8 Importante',
    category: 'Esperienza del Paziente',
    date: '1 Marzo 2026',
    readTime: '4 min di lettura',
    image: IMAGES.journal[1],
    excerpt: 'L\'impatto psicologico di spazi medici minimalisti e ben progettati sull\'ansia e sul recupero del paziente.'
  },
  {
    id: 'a3',
    title: 'Comprendere la Nuova Generazione di Neuromodulatori',
    category: 'Trattamenti',
    date: '24 Febbraio 2026',
    readTime: '6 min di lettura',
    image: IMAGES.journal[2],
    excerpt: 'Un\'analisi approfondita della longevit\u00E0 e della precisione delle moderne formulazioni di tossina botulinica.'
  },
  {
    id: 'a4',
    title: 'L\'Importanza della Consulenza Pre-Trattamento',
    category: 'Standard Medici',
    date: '15 Febbraio 2026',
    readTime: '3 min di lettura',
    image: IMAGES.journal[3],
    excerpt: 'Perch\u00E9 un\'accurata valutazione medica \u00E8 il primo passo non negoziabile in qualsiasi procedura estetica.'
  }
];

const ARTICLES_PER_PAGE = 3;

export function Journal() {
  // First article is featured (always shown). Grid shows the rest.
  // Start showing first 3 of the grid (ARTICLES.slice(1)), load more 3 at a time.
  const gridArticles = ARTICLES.slice(1);
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);
  const visibleGridArticles = gridArticles.slice(0, visibleCount);
  const hasMore = visibleCount < gridArticles.length;

  return (
    <div className="min-h-screen bg-ivory py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 border-b border-silver/20 pb-8">
          <h1 className="text-4xl md:text-5xl font-display font-light text-graphite mb-4">Journal</h1>
          <p className="text-lg text-graphite-light/70 font-light max-w-2xl">
            Approfondimenti, progressi medici e prospettive sul lusso medico architettonico.
          </p>
        </div>

        {/* Featured Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 group cursor-pointer"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-silver/20 sharp-edge overflow-hidden hover:border-graphite/30 transition-colors">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full bg-silver-light overflow-hidden">
              <img
                src={ARTICLES[0].image}
                alt={ARTICLES[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-silver mb-6">
                <span className="bg-ivory-dark px-2 py-1 text-graphite">{ARTICLES[0].category}</span>
                <span>{ARTICLES[0].date}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-light text-graphite mb-6 group-hover:text-silver transition-colors leading-tight">
                {ARTICLES[0].title}
              </h2>
              <p className="text-graphite-light/80 font-light leading-relaxed mb-8">
                {ARTICLES[0].excerpt}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-graphite group-hover:text-silver transition-colors">
                Leggi Articolo <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleGridArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer bg-white border border-silver/20 sharp-edge hover:border-graphite/30 transition-colors flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-silver-light">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-widest text-silver mb-4">
                  <span className="text-graphite">{article.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                </div>
                <h3 className="text-xl font-display font-medium text-graphite mb-4 group-hover:text-silver transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-graphite-light/70 font-light leading-relaxed mb-6 flex-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-graphite group-hover:text-silver transition-colors mt-auto pt-4 border-t border-silver/20">
                  Leggi Articolo <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + ARTICLES_PER_PAGE)}
              className="bg-ivory-dark border border-silver/30 text-graphite px-8 py-4 text-sm font-medium uppercase tracking-widest hover:border-graphite transition-colors sharp-edge"
            >
              Carica Altri Articoli
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
