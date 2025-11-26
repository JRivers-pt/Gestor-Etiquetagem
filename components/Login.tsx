import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './UIComponents';
import { Box, Lock, User, AlertCircle, Cloud } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Credenciais inválidas.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-blend-overlay bg-fixed">
      <div className="max-w-md w-full bg-white/95 backdrop-blur rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-8 text-center border-b-4 border-accent">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4 ring-2 ring-accent/50">
             <Box className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestor de Etiquetagem</h1>
          <p className="text-slate-400 text-sm mt-2 flex items-center justify-center gap-2">
            <Cloud className="w-3 h-3" /> Plataforma Industrial Híbrida
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email / Utilizador</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white text-slate-900 placeholder:text-slate-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operador@fabrica.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Palavra-Passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white text-slate-900 placeholder:text-slate-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3 text-lg font-bold shadow-lg shadow-accent/20" isLoading={loading}>
              Entrar
            </Button>

            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => { setEmail('admin@demo.com'); setPassword('admin'); }}
                className="text-xs text-slate-400 hover:text-accent transition-colors cursor-pointer"
              >
                 Demo? Use: <span className="font-mono text-slate-600">admin@demo.com</span> / <span className="font-mono text-slate-600">admin</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};