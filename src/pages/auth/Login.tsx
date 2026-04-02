import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, User, Building2, Shield } from 'lucide-react';
import { useAuth, ROLE_REDIRECTS } from '../../context/AuthContext';
import { IMAGES } from '../../lib/images';

const DEMO_ACCOUNTS = [
  { label: 'Paziente Demo', email: 'demo@nodeclinic.com', password: 'demo2026', icon: User },
  { label: 'Clinica Demo', email: 'clinica@nodeclinic.com', password: 'clinica2026', icon: Building2 },
  { label: 'Admin Demo', email: 'admin@nodeclinic.com', password: 'admin2026', icon: Shield },
] as const;

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect');

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);
    try {
      const user = await auth.login(loginEmail, loginPassword);
      const target = redirectTo || ROLE_REDIRECTS[user.role];
      navigate(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    performLogin(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen flex bg-ivory">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src={IMAGES.auth.login}
          alt="Node Clinic Architecture"
          className="absolute inset-0 w-full h-full object-cover opacity-90 saturate-75"
        />
        <div className="absolute inset-0 bg-graphite/10" />
        <div className="absolute inset-0 p-12 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white flex items-center justify-center sharp-edge">
              <div className="w-3 h-3 bg-graphite sharp-edge" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight uppercase">
              Node Clinic
            </span>
          </Link>
          <div className="text-white max-w-md">
            <h2 className="text-4xl font-display font-light mb-4 leading-tight">L'eccellenza medica, curata per te.</h2>
            <p className="font-light text-white/80">Accedi al tuo spazio privato per gestire le tue prenotazioni e scoprire i migliori specialisti.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-12">
            <Link to="/" className="flex items-center gap-2 text-graphite">
              <div className="w-8 h-8 bg-graphite flex items-center justify-center sharp-edge">
                <div className="w-3 h-3 bg-ivory sharp-edge" />
              </div>
              <span className="font-display font-semibold text-xl tracking-tight uppercase">
                Node Clinic
              </span>
            </Link>
          </div>

          <h1 className="text-3xl font-display font-light text-graphite mb-2">Bentornato.</h1>
          <p className="text-graphite-light/70 font-light mb-12">Inserisci le tue credenziali per accedere.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 sharp-edge"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium uppercase tracking-widest text-silver">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-silver hover:text-graphite transition-colors underline decoration-silver/50 underline-offset-4">
                  Dimenticata?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-graphite text-ivory py-4 mt-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Accesso in corso...
                </span>
              ) : <>Accedi <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo Quick Access */}
          <div className="mt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-silver/30" />
              <span className="text-xs uppercase tracking-widest text-silver font-medium">oppure accedi come</span>
              <div className="flex-1 h-px bg-silver/30" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                return (
                  <motion.button
                    key={account.email}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    disabled={loading}
                    className="bg-ivory-dark border border-silver/30 px-4 py-3 sharp-edge flex items-center justify-center gap-2 text-sm font-medium text-graphite hover:bg-graphite hover:text-ivory transition-colors disabled:opacity-50"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{account.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs text-silver text-center mt-4">
              Credenziali demo per esplorare la piattaforma
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-silver">
              Non hai un account?{' '}
              <Link to="/auth/register" className="text-graphite font-medium hover:underline underline-offset-4">
                Registrati ora
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
