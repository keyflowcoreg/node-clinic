import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { store } from '../services/store';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState('');

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Richiesta Generale');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const lead = store.leads.create({
      source: 'contact',
      name: `${name} ${surname}`.trim(),
      email,
      message: `[${subject}] ${message}`,
    });

    setLeadId(lead.id);
    setSubmitted(true);
  };

  function resetForm() {
    setSubmitted(false);
    setLeadId('');
    setName('');
    setSurname('');
    setEmail('');
    setSubject('Richiesta Generale');
    setMessage('');
  }

  return (
    <div className="min-h-screen bg-ivory py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 border-b border-silver/20 pb-8">
          <h1 className="text-4xl md:text-5xl font-display font-light text-graphite mb-4">Contattaci</h1>
          <p className="text-lg text-graphite-light/70 font-light max-w-2xl">
            Per richieste relative a prenotazioni, partnership o informazioni generali, il nostro team concierge &egrave; a tua disposizione.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-2xl font-display font-light text-graphite mb-8">Mettiti in contatto</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-ivory-dark border border-silver/30 flex items-center justify-center shrink-0 sharp-edge">
                    <Mail className="w-5 h-5 text-graphite" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-widest text-silver mb-1">Email</h3>
                    <p className="text-graphite-light">concierge@nodeclinic.com</p>
                    <p className="text-xs text-silver mt-1">Cerchiamo di rispondere entro 24 ore.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-ivory-dark border border-silver/30 flex items-center justify-center shrink-0 sharp-edge">
                    <Phone className="w-5 h-5 text-graphite" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-widest text-silver mb-1">Telefono</h3>
                    <p className="text-graphite-light">+39 02 1234 5678</p>
                    <p className="text-xs text-silver mt-1">Lun-Ven, 09:00 - 18:00 CET</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-ivory-dark border border-silver/30 flex items-center justify-center shrink-0 sharp-edge">
                    <MapPin className="w-5 h-5 text-graphite" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-widest text-silver mb-1">Sede Centrale</h3>
                    <p className="text-graphite-light">Via Monte Napoleone 8<br/>20121 Milano, Italia</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-graphite text-ivory p-8 sharp-edge">
              <h3 className="font-display text-xl mb-4">Emergenze Mediche</h3>
              <p className="text-silver-light/70 font-light text-sm leading-relaxed">
                Node Clinic &egrave; una piattaforma di prenotazione per procedure estetiche elettive. Se stai vivendo un&apos;emergenza medica, contatta immediatamente i servizi di emergenza locali o recati al pronto soccorso pi&ugrave; vicino.
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {submitted ? (
              <div className="bg-white border border-silver/20 p-12 text-center sharp-edge h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-graphite text-ivory rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-light text-graphite mb-4">Messaggio Inviato</h3>
                <p className="text-graphite-light/70 font-light leading-relaxed mb-2">
                  Grazie per averci contattato. Un membro del nostro team concierge ti contatter&agrave; a breve.
                </p>
                {leadId && (
                  <p className="text-sm text-silver mb-8">
                    Numero di riferimento: <span className="font-mono text-graphite">{leadId.toUpperCase()}</span>
                  </p>
                )}
                <button
                  onClick={resetForm}
                  className="text-sm font-medium uppercase tracking-widest text-silver hover:text-graphite transition-colors underline decoration-silver/50 underline-offset-4"
                >
                  Invia un altro messaggio
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-silver/20 p-8 md:p-12 sharp-edge space-y-6">
                <h2 className="text-2xl font-display font-light text-graphite mb-8">Invia un messaggio</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Nome</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-ivory-dark border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Cognome</label>
                    <input
                      required
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full bg-ivory-dark border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Indirizzo Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ivory-dark border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Oggetto</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-ivory-dark border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors text-graphite"
                  >
                    <option>Richiesta Generale</option>
                    <option>Assistenza Prenotazione</option>
                    <option>Partnership Clinica</option>
                    <option>Stampa &amp; Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Messaggio</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-ivory-dark border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge flex items-center justify-center gap-2 mt-4"
                >
                  Invia Messaggio <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
