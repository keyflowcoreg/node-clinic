import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'user' | 'clinic' | 'admin';

export type DemoUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicName?: string;
  avatar: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<DemoUser>;
  register: (email: string, password: string, name: string) => Promise<DemoUser>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'node-clinic-auth';

const DEMO_ACCOUNTS: Array<DemoUser & { password: string }> = [
  {
    id: 'usr_001',
    email: 'demo@nodeclinic.com',
    password: 'demo2026',
    name: 'Sofia Marchetti',
    role: 'user',
    avatar: 'SM',
  },
  {
    id: 'cli_001',
    email: 'clinica@nodeclinic.com',
    password: 'clinica2026',
    name: 'Dr. Laura Conti',
    role: 'clinic',
    clinicName: 'Aesthetic Milano',
    avatar: 'LC',
  },
  {
    id: 'adm_001',
    email: 'admin@nodeclinic.com',
    password: 'admin2026',
    name: 'Marco Ferretti',
    role: 'admin',
    avatar: 'MF',
  },
  {
    id: 'doc_001',
    email: 'dottore@nodeclinic.com',
    password: 'dottore2026',
    name: 'Dr. Alessandro Rossi',
    role: 'doctor',
    avatar: 'AR',
  },
];

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  user: '/user',
  clinic: '/portal',
  admin: '/admin',
  doctor: '/doctor',
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo helpers
function loadDemoUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoUser;
    if (parsed && parsed.id && parsed.email && parsed.role) {
      return parsed;
    }
    return null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveDemoUser(user: DemoUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearDemoUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function isDemoEmail(email: string): boolean {
  const demoEmails = DEMO_ACCOUNTS.map(a => a.email);
  return demoEmails.includes(email.toLowerCase().trim());
}

function supabaseUserToDemoUser(sbUser: SupabaseUser): DemoUser {
  const meta = sbUser.user_metadata || {};
  const name = meta.name || meta.full_name || sbUser.email?.split('@')[0] || 'User';
  const role: UserRole = (meta.role as UserRole) || 'user';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    name,
    role,
    avatar: initials || 'U',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check Supabase session first, then fall back to demo localStorage
  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Try Supabase session
      if (supabase) {
        try {
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          if (existingSession?.user && mounted) {
            setSession(existingSession);
            setUser(supabaseUserToDemoUser(existingSession.user));
            setIsDemo(false);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase session check failed:', err);
        }
      }

      // 2. Fall back to demo user in localStorage
      const demoUser = loadDemoUser();
      if (demoUser && mounted) {
        setUser(demoUser);
        setIsDemo(true);
      }

      if (mounted) setIsLoading(false);
    }

    init();

    // Listen for Supabase auth changes
    let subscription: { unsubscribe: () => void } | undefined;
    if (supabase) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          if (newSession?.user) {
            setUser(supabaseUserToDemoUser(newSession.user));
            setIsDemo(false);
          } else if (!loadDemoUser()) {
            // Only clear if no demo user either
            setUser(null);
            setIsDemo(false);
          }
        }
      );
      subscription = sub;
    }

    // Listen for localStorage changes (demo cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          const parsed = JSON.parse(e.newValue) as DemoUser;
          setUser(parsed);
          setIsDemo(true);
        } else if (!session) {
          setUser(null);
          setIsDemo(false);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string): Promise<DemoUser> => {
    const normalizedEmail = email.toLowerCase().trim();

    // Demo login path
    if (isDemoEmail(normalizedEmail)) {
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email === normalizedEmail && a.password === password
      );
      if (!account) {
        throw new Error('Credenziali demo non valide.');
      }
      const { password: _, ...userData } = account;
      setUser(userData);
      setSession(null);
      setIsDemo(true);
      saveDemoUser(userData);
      return userData;
    }

    // Real Supabase login
    if (!supabase) {
      throw new Error('Supabase non configurato. Usa un account demo.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login')) {
        throw new Error('Email o password non corretti.');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login fallito.');
    }

    const demoUser = supabaseUserToDemoUser(data.user);
    setUser(demoUser);
    setSession(data.session);
    setIsDemo(false);
    clearDemoUser(); // Clear any demo user from localStorage
    return demoUser;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<DemoUser> => {
    if (!supabase) {
      throw new Error('Supabase non configurato. Registrazione non disponibile.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          name,
          role: 'user',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Questa email è già registrata. Prova ad accedere.');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registrazione fallita.');
    }

    // If email confirmation is required, user won't have a session yet
    if (!data.session) {
      // Create a temporary local user so they see a success state
      const tempUser: DemoUser = {
        id: data.user.id,
        email: data.user.email || email,
        name,
        role: 'user',
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      };
      // Don't set as authenticated - they need to confirm email
      throw new Error('Registrazione completata! Controlla la tua email per confermare l\'account.');
    }

    const demoUser = supabaseUserToDemoUser(data.user);
    setUser(demoUser);
    setSession(data.session);
    setIsDemo(false);
    return demoUser;
  }, []);

  const logout = useCallback(async () => {
    // Clear demo state
    clearDemoUser();
    setUser(null);
    setSession(null);
    setIsDemo(false);

    // Sign out from Supabase if connected
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    isAuthenticated: user !== null,
    isDemo,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
