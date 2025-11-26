import React, { useState, useEffect } from 'react';
import { Package, Tags, Box, Settings, BarChart, LogOut, HelpCircle, Cloud, CloudOff, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { cloudService } from '../services/cloudService';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const MenuCard: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void, colorClass: string }> = ({ title, icon, onClick, colorClass }) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center gap-4 group h-40"
  >
    <div className={`p-4 rounded-full ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
      {React.cloneElement(icon as React.ReactElement, { className: `w-8 h-8 ${colorClass.replace('bg-', 'text-')}` })}
    </div>
    <span className="font-semibold text-slate-700 text-lg">{title}</span>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string>('...');

  useEffect(() => {
    cloudService.checkConnection().then(setIsCloudConnected);
    const interval = setInterval(() => {
      cloudService.checkConnection().then(status => {
        setIsCloudConnected(status);
        if(status) setLastSync(new Date().toLocaleTimeString());
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto w-full">
        <div className="mb-10 flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
             <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{t('dashboard.title')}</h1>
             <p className="text-slate-500 text-lg">
               {t('dashboard.subtitle')} | <span className="text-accent">Olá, {user?.name}</span>
             </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isCloudConnected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {isCloudConnected ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
                <span className="font-semibold">{isCloudConnected ? 'Cloud: Ligado' : 'Modo Offline'}</span>
             </div>
             {isCloudConnected && <span className="text-slate-400 text-xs">Sync: {lastSync}</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MenuCard 
            title={t('dashboard.products')}
            icon={<Package />} 
            colorClass="bg-blue-500" 
            onClick={() => onNavigate('products')} 
          />
          <MenuCard 
            title={t('dashboard.orders')}
            icon={<Box />} 
            colorClass="bg-amber-500" 
            onClick={() => onNavigate('orders')} 
          />
          <MenuCard 
            title={t('dashboard.labeling')}
            icon={<Tags />} 
            colorClass="bg-green-500" 
            onClick={() => onNavigate('labeling')} 
          />
           <MenuCard 
            title={t('dashboard.settings')}
            icon={<Settings />} 
            colorClass="bg-slate-500" 
            onClick={() => onNavigate('settings')} 
          />
          <MenuCard 
            title={t('common.help')}
            icon={<HelpCircle />} 
            colorClass="bg-cyan-500" 
            onClick={() => onNavigate('help')} 
          />
          {user?.role === 'admin' && (
             <MenuCard 
                title="Admin Global"
                icon={<Shield />} 
                colorClass="bg-rose-500" 
                onClick={() => alert('Painel Admin disponível na versão Enterprise')} 
             />
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <button 
            onClick={logout}
            className="flex items-center text-slate-400 hover:text-red-500 transition-colors gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('dashboard.logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};