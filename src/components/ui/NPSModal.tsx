import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, X } from 'lucide-react';
import { store } from '../../services/store';
import { useAuth } from '../../context/AuthContext';

export function NPSModal({
  bookingId,
  clinicId,
  treatmentName,
  onClose,
}: {
  bookingId: string;
  clinicId: string;
  treatmentName: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    if (rating === 0 || !user) return;
    setSubmitting(true);

    store.reviews.create({
      clinic_id: clinicId,
      user_id: user.id,
      user_name: user.name,
      booking_id: bookingId,
      rating,
      text: comment || 'Nessun commento.',
      treatment: treatmentName,
    });

    sessionStorage.setItem('nc_nps_' + bookingId, '1');
    setSubmitting(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-graphite/60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        className="relative bg-white border border-silver/20 sharp-edge w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-silver hover:text-graphite transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-display font-light text-graphite mb-2">
          Come valuteresti la tua esperienza?
        </h2>
        <p className="text-sm text-silver mb-8">{treatmentName}</p>

        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoveredStar || rating);
            return (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    filled
                      ? 'fill-warm text-warm'
                      : 'fill-transparent text-silver'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Racconta la tua esperienza..."
          rows={4}
          className="w-full bg-ivory-dark border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors text-sm text-graphite placeholder:text-silver resize-none mb-6"
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Invio...' : 'Invia Recensione'}
        </button>
      </motion.div>
    </div>
  );
}
