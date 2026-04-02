import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LayoutDashboard, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  }

  const roleLink = user?.role === 'admin'
    ? { label: 'Admin Panel', to: '/admin', icon: Shield }
    : user?.role === 'clinic'
      ? { label: 'Dashboard Clinica', to: '/portal', icon: LayoutDashboard }
      : { label: 'La Mia Area', to: '/user', icon: User };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-panel border-b-0' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-graphite flex items-center justify-center sharp-edge">
                  <div className="w-3 h-3 bg-ivory sharp-edge" />
                </div>
                <span className="font-display font-semibold text-xl tracking-tight uppercase">
                  Node Clinic
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/search" className="text-sm font-medium hover:text-silver transition-colors uppercase tracking-widest relative group">
                Trattamenti
                <span className="absolute -bottom-1 left-0 w-full h-px bg-graphite scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Link to="/search" className="text-sm font-medium hover:text-silver transition-colors uppercase tracking-widest relative group">
                Cliniche
                <span className="absolute -bottom-1 left-0 w-full h-px bg-graphite scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-silver transition-colors uppercase tracking-widest relative group">
                La Nostra Visione
                <span className="absolute -bottom-1 left-0 w-full h-px bg-graphite scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <div className="w-px h-4 bg-silver/30" />

              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 bg-graphite text-ivory font-medium text-sm flex items-center justify-center sharp-edge">
                      {user.avatar}
                    </div>
                    <span className="text-sm font-medium text-graphite group-hover:text-silver transition-colors max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-ivory border border-silver/20 shadow-lg sharp-edge z-50"
                      >
                        <div className="py-2">
                          <Link
                            to={roleLink.to}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest text-graphite hover:bg-ivory-dark transition-colors"
                          >
                            <roleLink.icon className="w-4 h-4" />
                            {roleLink.label}
                          </Link>
                          <div className="border-t border-silver/20 my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Esci
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="text-sm font-medium hover:text-silver transition-colors uppercase tracking-widest"
                >
                  Accedi
                </Link>
              )}

              {isAuthenticated && user?.role === 'clinic' ? (
                <Link to="/portal" className="bg-graphite text-ivory px-6 py-2.5 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge">
                  Il Mio Portale
                </Link>
              ) : (
                <Link to="/partner" className="bg-graphite text-ivory px-6 py-2.5 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge">
                  Per Partner
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4 md:hidden">
              <button
                className="p-2 hover:bg-silver-light/50 transition-colors sharp-edge"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden bg-ivory border-b border-silver/20 absolute w-full overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
                <Link to="/search" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium uppercase tracking-widest text-graphite hover:bg-silver-light/20">
                  Trattamenti
                </Link>
                <Link to="/search" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium uppercase tracking-widest text-graphite hover:bg-silver-light/20">
                  Cliniche
                </Link>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium uppercase tracking-widest text-graphite hover:bg-silver-light/20">
                  La Nostra Visione
                </Link>

                {isAuthenticated && user ? (
                  <>
                    <div className="border-t border-silver/20 pt-4">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 bg-graphite text-ivory font-medium text-sm flex items-center justify-center sharp-edge">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-graphite">{user.name}</div>
                          <div className="text-xs text-silver">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={roleLink.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium uppercase tracking-widest text-graphite hover:bg-silver-light/20"
                    >
                      <roleLink.icon className="w-4 h-4" />
                      {roleLink.label}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium uppercase tracking-widest text-red-500 hover:bg-red-50"
                    >
                      Esci
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 text-base font-medium uppercase tracking-widest text-graphite hover:bg-silver-light/20"
                  >
                    Accedi
                  </Link>
                )}

                {isAuthenticated && user?.role === 'clinic' ? (
                  <Link to="/portal" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium uppercase tracking-widest text-graphite hover:bg-silver-light/20">
                    Il Mio Portale
                  </Link>
                ) : (
                  <Link to="/partner" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium uppercase tracking-widest text-graphite hover:bg-silver-light/20">
                    Per Partner
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
