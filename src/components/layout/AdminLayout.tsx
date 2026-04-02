import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarCheck, Megaphone, BarChart3, Users, Stethoscope, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/clinics', label: 'Cliniche', icon: Building2 },
    { path: '/admin/bookings', label: 'Prenotazioni', icon: CalendarCheck },
    { path: '/admin/landing-pages', label: 'Landing Pages', icon: Megaphone },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/users', label: 'Utenti', icon: Users },
    { path: '/admin/treatments', label: 'Trattamenti', icon: Stethoscope },
    { path: '/admin/payments', label: 'Pagamenti', icon: CreditCard },
    { path: '/admin/settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-graphite text-ivory border-r border-graphite-light shrink-0 flex flex-col">
        <div className="p-8 border-b border-graphite-light">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-ivory flex items-center justify-center sharp-edge">
              <div className="w-3 h-3 bg-graphite sharp-edge" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight uppercase">
              Node Clinic
            </span>
          </Link>
          <p className="text-sm text-silver uppercase tracking-widest font-medium">Admin Panel</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest transition-colors sharp-edge ${
                  isActive ? 'bg-ivory text-graphite' : 'text-silver hover:bg-graphite-light hover:text-ivory'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-graphite-light">
          <button
            onClick={() => { logout(); navigate('/auth/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest text-red-400 hover:bg-red-900/20 transition-colors sharp-edge"
          >
            <LogOut className="w-4 h-4" /> Esci
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
