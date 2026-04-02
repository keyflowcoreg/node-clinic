import { motion, AnimatePresence } from 'motion/react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Conferma',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white sharp-edge p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-display font-medium text-graphite mb-3">{title}</h3>
            <p className="text-sm text-graphite-light/70 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 border border-silver/30 text-sm font-medium uppercase tracking-widest text-graphite sharp-edge hover:bg-ivory transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2.5 text-white text-sm font-medium uppercase tracking-widest sharp-edge transition-colors ${
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
