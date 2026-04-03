import { motion } from 'motion/react';
import { ShieldCheck, Star, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../lib/images';

export function About() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.heroes.about}
            alt="Architectural background"
            className="w-full h-full object-cover opacity-30 saturate-75"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory/80 to-ivory z-10" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-light leading-tight tracking-tighter mb-6 text-graphite">
              Eleviamo lo standard della <span className="font-semibold">medicina estetica.</span>
            </h1>
            <p className="text-lg md:text-xl text-graphite-light/80 font-light leading-relaxed">
              Node Clinic è stata fondata su una semplice premessa: trovare cure mediche eccezionali dovrebbe essere semplice e raffinato quanto i trattamenti stessi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Problem / Solution */}
      <section className="py-24 bg-white border-y border-silver/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
            <div>
              <h2 className="text-3xl font-display font-light text-graphite mb-6">La Sfida del Settore</h2>
              <p className="text-graphite-light/80 font-light leading-relaxed mb-6">
                Il settore della medicina estetica è frammentato. I pazienti affrontano prezzi opachi, standard medici incoerenti e processi di prenotazione obsoleti. Trovare un professionista di fiducia spesso si basa sul passaparola piuttosto che su credenziali verificate.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-display font-light text-graphite mb-6">La Nostra Soluzione</h2>
              <p className="text-graphite-light/80 font-light leading-relaxed mb-6">
                Agiamo come un curatore rigoroso. Selezioniamo ogni clinica, standardizzando l'esperienza di prenotazione e garantendo assoluta trasparenza sui prezzi e sulle qualifiche mediche. Portiamo il lusso architettonico e l'efficienza digitale nelle prenotazioni mediche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Vetting Process */}
      <section className="py-32 bg-graphite text-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-light mb-6">Lo Standard Node</h2>
            <p className="text-silver-light/70 font-light leading-relaxed">
              Meno del 15% delle cliniche che si candidano viene accettato nel nostro network. Il nostro comitato medico valuta ogni partner secondo criteri rigorosi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto border border-silver/30 flex items-center justify-center mb-6 sharp-edge">
                <ShieldCheck className="w-6 h-6 text-ivory" />
              </div>
              <h3 className="font-display text-xl mb-4">Eccellenza Medica</h3>
              <p className="text-silver-light/70 font-light text-sm leading-relaxed">
                Verifica di tutte le licenze mediche, dei registri di formazione continua e dell'adesione ai più recenti protocolli di sicurezza.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto border border-silver/30 flex items-center justify-center mb-6 sharp-edge">
                <Star className="w-6 h-6 text-ivory" />
              </div>
              <h3 className="font-display text-xl mb-4">Qualità Architettonica</h3>
              <p className="text-silver-light/70 font-light text-sm leading-relaxed">
                L'ambiente fisico deve riflettere la qualità delle cure. Richiediamo strutture moderne, igieniche ed esteticamente raffinate.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto border border-silver/30 flex items-center justify-center mb-6 sharp-edge">
                <Users className="w-6 h-6 text-ivory" />
              </div>
              <h3 className="font-display text-xl mb-4">Esperienza del Paziente</h3>
              <p className="text-silver-light/70 font-light text-sm leading-relaxed">
                Dalla reception al follow-up, monitoriamo il feedback dei pazienti per garantire un'esperienza premium ed empatica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-ivory-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-light text-graphite mb-8">Vivi la differenza.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search" className="bg-graphite text-ivory px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge flex items-center justify-center gap-2">
              Trova una Clinica <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/partner" className="bg-white border border-silver/30 text-graphite px-8 py-4 text-sm font-medium uppercase tracking-widest hover:border-graphite transition-colors sharp-edge">
              Candidati come Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
