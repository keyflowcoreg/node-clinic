import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { MultiStepForm } from '../components/ui/MultiStepForm';

const PARTNER_STEPS = [
  {
    title: 'Dettagli Clinica',
    description: 'Informazioni sulla struttura che intende candidarsi.',
    fields: [
      {
        name: 'nomeClinica',
        label: 'Nome Clinica',
        type: 'text' as const,
        required: true,
        placeholder: 'Nome della clinica',
      },
      {
        name: 'citta',
        label: 'Città',
        type: 'text' as const,
        required: true,
        placeholder: 'Es. Milano',
      },
      {
        name: 'indirizzo',
        label: 'Indirizzo',
        type: 'text' as const,
        required: true,
        placeholder: 'Via/Piazza, numero civico, CAP',
      },
    ],
  },
  {
    title: 'Direttore Sanitario',
    description: 'Dati del responsabile medico della struttura.',
    fields: [
      {
        name: 'nomeCompleto',
        label: 'Nome Completo',
        type: 'text' as const,
        required: true,
        placeholder: 'Nome e cognome',
      },
      {
        name: 'iscrizioneAlbo',
        label: 'Iscrizione Albo',
        type: 'text' as const,
        required: true,
        placeholder: 'Numero iscrizione',
      },
      {
        name: 'emailProfessionale',
        label: 'Email Professionale',
        type: 'email' as const,
        required: true,
        placeholder: 'email@clinica.it',
      },
      {
        name: 'telefono',
        label: 'Telefono',
        type: 'tel' as const,
        required: true,
        placeholder: '+39...',
      },
    ],
  },
  {
    title: 'Specializzazioni',
    description: 'Area di competenza e informazioni aggiuntive.',
    fields: [
      {
        name: 'specializzazioni',
        label: 'Specializzazione Principale',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'chirurgia-plastica', label: 'Chirurgia Plastica' },
          { value: 'medicina-estetica', label: 'Medicina Estetica' },
          { value: 'dermatologia', label: 'Dermatologia' },
          { value: 'laserterapia', label: 'Laserterapia' },
          { value: 'nutrizione', label: 'Nutrizione' },
          { value: 'anti-aging', label: 'Anti-aging' },
        ],
      },
      {
        name: 'note',
        label: 'Note Aggiuntive',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Sito web, note aggiuntive...',
      },
    ],
  },
];

export function PartnerApplication() {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white border border-silver/20 p-12 text-center sharp-edge"
        >
          <div className="w-16 h-16 bg-graphite text-ivory rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-light text-graphite mb-4">Candidatura Ricevuta</h2>
          <p className="text-graphite-light/70 mb-8 font-light leading-relaxed">
            Grazie per l'interesse a unirti a Node Clinic. Il nostro comitato medico esaminerà la tua candidatura e le credenziali della struttura. Solitamente rispondiamo entro 3-5 giorni lavorativi.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-graphite text-ivory px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge"
          >
            Torna alla Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-light text-graphite mb-4">Diventa Partner.</h1>
          <p className="text-lg text-graphite-light/70 font-light max-w-xl">
            Unisciti al network più esclusivo di professionisti medici e della medicina estetica in Italia. Curiamo l'eccellenza.
          </p>
        </div>

        <MultiStepForm
          steps={PARTNER_STEPS}
          onSubmit={handleSubmit}
          submitLabel="Invia Candidatura"
        />

        <p className="text-xs text-silver mt-8 leading-relaxed text-center max-w-xl mx-auto">
          Inviando questa candidatura, accetti i nostri Termini di Servizio per Partner. Node Clinic opera un rigoroso processo di selezione. L'invio non garantisce l'accettazione nel network.
        </p>
      </div>
    </div>
  );
}
