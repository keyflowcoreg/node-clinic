import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BarChart3 } from 'lucide-react';
import type { Treatment } from '../../types/database';

export function TreatmentComparison({
  treatments,
  onRemove,
  onClose,
}: {
  treatments: Treatment[];
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [showModal, setShowModal] = useState(false);

  const lowestPrice = Math.min(...treatments.map((t) => t.price_from));
  const shortestDuration = Math.min(...treatments.map((t) => t.duration_min));

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-silver/20 shadow-lg sharp-edge">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {treatments.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 bg-ivory-dark border border-silver/30 px-3 py-2 sharp-edge shrink-0"
              >
                <span className="text-xs font-medium text-graphite truncate max-w-[120px]">
                  {t.name}
                </span>
                <button
                  onClick={() => onRemove(t.id)}
                  className="text-silver hover:text-graphite transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="text-xs font-medium uppercase tracking-widest text-silver hover:text-graphite transition-colors"
            >
              Annulla
            </button>
            {treatments.length >= 2 && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-graphite text-ivory px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Confronta ({treatments.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => setShowModal(false)}
          >
            <div className="absolute inset-0 bg-graphite/60" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-white border border-silver/20 sharp-edge w-full max-w-3xl max-h-[80vh] overflow-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-light text-graphite">
                  Confronto Trattamenti
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-silver hover:text-graphite transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-silver/20">
                      <th className="text-left text-xs font-medium uppercase tracking-widest text-silver py-3 pr-4 w-32">
                        Caratteristica
                      </th>
                      {treatments.map((t) => (
                        <th
                          key={t.id}
                          className="text-left text-xs font-medium uppercase tracking-widest text-graphite py-3 px-4"
                        >
                          {t.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-silver/10">
                      <td className="py-4 pr-4 text-xs font-medium uppercase tracking-widest text-silver">
                        Categoria
                      </td>
                      {treatments.map((t) => (
                        <td key={t.id} className="py-4 px-4 text-graphite capitalize">
                          {t.category}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-silver/10">
                      <td className="py-4 pr-4 text-xs font-medium uppercase tracking-widest text-silver">
                        Prezzo
                      </td>
                      {treatments.map((t) => (
                        <td
                          key={t.id}
                          className={`py-4 px-4 font-medium ${
                            t.price_from === lowestPrice
                              ? 'text-warm'
                              : 'text-graphite'
                          }`}
                        >
                          {'\u20AC'}{t.price_from} - {'\u20AC'}{t.price_to}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-silver/10">
                      <td className="py-4 pr-4 text-xs font-medium uppercase tracking-widest text-silver">
                        Durata
                      </td>
                      {treatments.map((t) => (
                        <td
                          key={t.id}
                          className={`py-4 px-4 font-medium ${
                            t.duration_min === shortestDuration
                              ? 'text-warm'
                              : 'text-graphite'
                          }`}
                        >
                          {t.duration_min} min
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 pr-4 text-xs font-medium uppercase tracking-widest text-silver align-top">
                        Descrizione
                      </td>
                      {treatments.map((t) => (
                        <td
                          key={t.id}
                          className="py-4 px-4 text-graphite-light/70 text-xs leading-relaxed"
                        >
                          {t.description}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
