import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🛠️ FUNÇÃO AUXILIAR: Busca o perfil completo na tabela 'users'
const fetchUserProfile = async (userId: string, email: string): Promise<User | null> => {
    try {
        // Consultar a tabela 'users' (o seu perfil) pelo ID
        const { data, error } = await supabase
            .from('users')
            .select('id, email, name, role, company_id') // company_id e role devem existir aqui
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error("Erro ao buscar perfil:", error);
            // Retornar um perfil básico se falhar (pode ser ajustado)
            return {
                id: userId,
                email: email,
                name: email, // Usar o email se o nome falhar
                role: 'operator',
                companyId: 'default' 
            } as User;
        }

        // Mapear os campos da base de dados (snake_case) para o tipo User (camelCase)
        return {
            id: data.id,
            email: data.email,
            name: data.name || data.email, // Usa o nome personalizado ou o email
            role: data.role || 'operator',
            companyId: data.company_id // <-- ESTE É O CAMPO CRUCIAL
        } as User;

    } catch (e) {
        console.error("Exceção ao carregar perfil:", e);
        return null;
    }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

    // 🛠️ FUNÇÃO AUXILIAR: Lida com a mudança de estado e carrega o perfil
    const handleAuthSession = async (session: { user: { id: string, email: string | undefined } } | null) => {
        if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id, session.user.email || '');

            if (userProfile) {
                setAuth({
                    user: userProfile, // <-- USA O PERFIL CARREGADO DA DB
                    isAuthenticated: true,
                    isLoading: false
                });
            } else {
                // Falha ao carregar perfil, logout forçado ou mostrar erro
                setAuth({ user: null, isAuthenticated: false, isLoading: false });
            }
        } else {
            setAuth({ user: null, isAuthenticated: false, isLoading: false });
        }
    };


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthSession(session); // <-- USA A NOVA FUNÇÃO AQUI
    });

    return () => subscription.unsubscribe();
  }, []);


  // A função login permanece inalterada, pois o 'onAuthStateChange' fará o resto.
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