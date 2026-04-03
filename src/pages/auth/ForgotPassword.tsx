import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (supabase) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (resetError) throw resetError;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'invio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/auth/login" className="flex items-center gap-2 text-sm text-silver hover:text-graphite mb-8">
          <ArrowLeft className="w-4 h-4" /> Torna al login
        </Link>

        {sent ? (
          <div className="bg-white border border-silver/20 p-8 sharp-edge text-center">
            <CheckCircle2 className="w-12 h-12 text-warm mx-auto mb-4" />
            <h2 className="text-2xl font-display font-light text-graphite mb-4">Email Inviata</h2>
            <p className="text-sm text-graphite-light/70">
              Se un account esiste con {email}, riceverai un link per reimpostare la password.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-silver/20 p-8 sharp-edge">
            <h2 className="text-2xl font-display font-light text-graphite mb-2">Password Dimenticata</h2>
            <p className="text-sm text-graphite-light/70 mb-8">
              Inserisci la tua email e ti invieremo un link per reimpostare la password.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-6 sharp-edge">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-ivory-dark border border-silver/30 sharp-edge focus:border-graphite focus:ring-0 outline-none text-sm"
                    placeholder="email@esempio.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge disabled:opacity-50"
              >
                {loading ? 'Invio in corso...' : 'Invia Link di Reset'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
