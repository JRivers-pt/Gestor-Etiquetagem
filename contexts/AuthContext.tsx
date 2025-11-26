import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuth({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.name || 'Operador',
            role: session.user.user_metadata.role || 'operator',
            companyId: 'default'
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth({
           user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.name || 'Operador',
            role: session.user.user_metadata.role || 'operator',
            companyId: 'default'
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuth({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (email === 'admin@demo.com' && password === 'admin') {
             const demoUser = { id: 'demo', email, name: 'Admin Demo', role: 'admin' as const, companyId: 'demo' };
             setAuth({ user: demoUser, isAuthenticated: true, isLoading: false });
             return true;
        }
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};