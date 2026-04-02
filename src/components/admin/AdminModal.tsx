import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
};

export function AdminModal({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className={`bg-white sharp-edge w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-silver/20">
              <h2 className="text-lg font-display font-medium text-graphite uppercase tracking-wider">
                {title}
              </h2>
              <button onClick={onClose} className="p-1 text-silver hover:text-graphite transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
            {footer && (
              <div className="flex justify-end gap-3 p-6 border-t border-silver/20">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
