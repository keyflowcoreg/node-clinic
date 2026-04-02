import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: 'border-emerald-500 bg-emerald-50 text-emerald-800',
  error: 'border-red-500 bg-red-50 text-red-800',
  info: 'border-graphite bg-ivory text-graphite',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-3 px-4 py-3 border-l-4 sharp-edge shadow-lg ${COLORS[toast.type]}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="p-0.5 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
