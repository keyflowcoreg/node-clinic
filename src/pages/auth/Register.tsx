import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { IMAGES } from '../../lib/images';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual registration
    navigate('/search');
  };

  return (
    <div className="min-h-screen flex bg-ivory">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src={IMAGES.auth.register}
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
            <h2 className="text-4xl font-display font-light mb-4 leading-tight">Unisciti all'élite.</h2>
            <p className="font-light text-white/80">Crea il tuo account per prenotare trattamenti nelle strutture mediche più esclusive e rigorosamente selezionate.</p>
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

          <h1 className="text-3xl font-display font-light text-graphite mb-2">Crea Account.</h1>
          <p className="text-graphite-light/70 font-light mb-12">Inizia il tuo percorso di eccellenza medica.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Nome</label>
                <input 
                  type="text" 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Cognome</label>
                <input 
                  type="text" 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Password</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors" 
              />
            </div>

            <button type="submit" className="w-full bg-graphite text-ivory py-4 mt-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge flex items-center justify-center gap-2">
              Registrati <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-silver">
              Hai già un account?{' '}
              <Link to="/auth/login" className="text-graphite font-medium hover:underline underline-offset-4">
                Accedi
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
