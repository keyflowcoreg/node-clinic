import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

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
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<DemoUser>;
  logout: () => void;
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
];

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  user: '/user',
  clinic: '/portal',
  admin: '/admin',
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): DemoUser | null {
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

function saveUser(user: DemoUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => loadUser());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setUser(e.newValue ? (JSON.parse(e.newValue) as DemoUser) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<DemoUser> => {
    const normalizedEmail = email.toLowerCase().trim();

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === normalizedEmail && a.password === password
    );

    if (!account) {
      throw new Error('Credenziali non valide. Usa un account demo.');
    }

    const { password: _, ...userData } = account;
    setUser(userData);
    saveUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearUser();
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    login,
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
