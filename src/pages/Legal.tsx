import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

const CONTENT = {
  '/terms': {
    title: 'Termini di Servizio',
    lastUpdated: '10 Marzo 2026',
    sections: [
      {
        heading: '1. Introduzione',
        text: 'Benvenuto su Node Clinic. Questi Termini di Servizio ("Termini") regolano l\'utilizzo della nostra piattaforma. Accedendo o utilizzando Node Clinic, accetti di essere vincolato da questi Termini.'
      },
      {
        heading: '2. Ruolo della Piattaforma',
        text: 'Node Clinic funge esclusivamente da facilitatore per informazioni e prenotazioni. La prestazione è della clinica partner, la piattaforma facilita informazione e prenotazione. Non forniamo servizi medici, consulenze o trattamenti direttamente. Tutti i servizi medici sono forniti da cliniche partner indipendenti e verificate e dai rispettivi professionisti medici.'
      },
      {
        heading: '3. Prenotazioni e Depositi',
        text: 'Quando prenoti un appuntamento tramite Node Clinic, è richiesto un deposito per assicurare il tuo posto. Questo deposito viene addebitato immediatamente. Il saldo rimanente per il trattamento deve essere pagato direttamente alla clinica al momento dell\'appuntamento. I depositi sono completamente rimborsabili se l\'appuntamento viene cancellato almeno 48 ore prima dell\'orario previsto.'
      },
      {
        heading: '4. Disclaimer Medico',
        text: 'Le informazioni fornite su Node Clinic sono solo a scopo informativo e non sostituiscono la consulenza, la diagnosi o il trattamento medico professionale. Cerca sempre il parere del tuo medico o di un altro operatore sanitario qualificato per qualsiasi domanda tu possa avere riguardo a una condizione medica.'
      },
      {
        heading: '5. Responsabilità dell\'Utente',
        text: 'Accetti di fornire informazioni accurate, attuali e complete durante il processo di prenotazione. Sei responsabile del mantenimento della riservatezza del tuo account e della tua password e di limitare l\'accesso al tuo computer o dispositivo mobile.'
      }
    ]
  },
  '/privacy': {
    title: 'Privacy Policy',
    lastUpdated: '10 Marzo 2026',
    sections: [
      {
        heading: '1. Raccolta Dati',
        text: 'Raccogliamo le informazioni personali che ci fornisci volontariamente quando ti registri su Node Clinic, esprimendo interesse a ottenere informazioni su di noi o sui nostri prodotti e servizi, o quando partecipi alle attività sulla piattaforma.'
      },
      {
        heading: '2. Trattamento dei Dati Sanitari (GDPR Art. 9)',
        text: 'In quanto piattaforma che facilita le prenotazioni mediche, potremmo trattare categorie particolari di dati personali (dati sanitari) come definito dall\'Articolo 9 del GDPR. Questo trattamento è strettamente limitato a quanto necessario per la fornitura del servizio di prenotazione e viene effettuato con il tuo consenso esplicito. Non conserviamo immagini diagnostiche o cartelle cliniche dettagliate in questa fase MVP.'
      },
      {
        heading: '3. Condivisione dei Dati',
        text: 'Condividiamo le informazioni della tua prenotazione (nome, dettagli di contatto, trattamento selezionato e orario dell\'appuntamento) esclusivamente con la specifica clinica partner con cui hai scelto di prenotare. Non vendiamo i tuoi dati personali a terzi.'
      },
      {
        heading: '4. Sicurezza dei Dati',
        text: 'Abbiamo implementato adeguate misure di sicurezza tecniche e organizzative progettate per proteggere la sicurezza di qualsiasi informazione personale che trattiamo. Tuttavia, ricorda anche che non possiamo garantire che Internet stesso sia sicuro al 100%.'
      },
      {
        heading: '5. I Tuoi Diritti',
        text: 'Ai sensi del GDPR, hai il diritto di accedere, rettificare o cancellare i tuoi dati personali, nonché il diritto di limitare o opporti a determinate attività di trattamento. Puoi esercitare questi diritti attraverso la tua Area Utente o contattando il nostro Responsabile della Protezione dei Dati.'
      }
    ]
  },
  '/cookies': {
    title: 'Cookie Policy',
    lastUpdated: '10 Marzo 2026',
    sections: [
      {
        heading: '1. Cosa sono i cookie?',
        text: 'I cookie sono piccoli file di testo che vengono posizionati sul tuo computer o dispositivo mobile quando visiti un sito web. Sono ampiamente utilizzati per far funzionare i siti web, o per farli funzionare in modo più efficiente, nonché per fornire informazioni ai proprietari del sito.'
      },
      {
        heading: '2. Come utilizziamo i cookie',
        text: 'Utilizziamo i cookie essenziali per abilitare funzionalità di base come sicurezza, gestione della rete e accessibilità. Puoi disabilitarli modificando le impostazioni del tuo browser, ma ciò potrebbe influire sul funzionamento del sito web.'
      },
      {
        heading: '3. Analitica',
        text: 'Utilizziamo i cookie analitici per aiutarci a migliorare il nostro sito web raccogliendo e segnalando informazioni su come lo utilizzi. I cookie raccolgono informazioni in un modo che non identifica direttamente nessuno.'
      }
    ]
  }
};

export function Legal() {
  const location = useLocation();
  const content = CONTENT[location.pathname as keyof typeof CONTENT] || CONTENT['/terms'];

  return (
    <div className="min-h-screen bg-ivory py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-16 border-b border-silver/20 pb-8">
            <h1 className="text-4xl md:text-5xl font-display font-light text-graphite mb-4">{content.title}</h1>
            <p className="text-sm font-medium uppercase tracking-widest text-silver">
              Ultimo Aggiornamento: {content.lastUpdated}
            </p>
          </div>

          <div className="space-y-12">
            {content.sections.map((section, index) => (
              <div key={index} className="mb-12">
                <h2 className="text-2xl font-display font-medium text-graphite mb-4">{section.heading}</h2>
                <p className="text-lg text-graphite-light/80 font-light leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-8 border-t border-silver/20">
            <p className="text-sm text-silver font-light leading-relaxed">
              In caso di domande su questi termini, contatta il nostro team legale all'indirizzo legal@nodeclinic.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
