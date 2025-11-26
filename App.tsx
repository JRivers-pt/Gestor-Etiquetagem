import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProductManager } from './components/ProductManager';
import { PackingOrderForm } from './components/PackingOrder';
import { LabelingStation } from './components/LabelingStation';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { HelpManual } from './components/HelpManual';
import { PackingOrder, PackingStatus } from './types';
import { ArrowLeft, Globe } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { storageService } from './services/storageService';
import { useAuth } from './contexts/AuthContext';

const AuthenticatedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeOrder, setActiveOrder] = useState<PackingOrder | null>(null);
  const { language, setLanguage, t } = useLanguage();
  
  const navigate = (view: string) => {
    // Reset active order if going back to dashboard or products
    if (view === 'dashboard' || view === 'products') {
      setActiveOrder(null);
    }
    setCurrentView(view);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  const handleLabelingStart = () => {
     const orders = storageService.getOrders();
     const openOrder = orders.find(o => o.status === PackingStatus.IN_PROGRESS || o.status === PackingStatus.OPEN);
     
     if (openOrder) {
       setActiveOrder(openOrder);
       navigate('labeling');
     } else {
       alert(t('orders.statOpen') + " necessário. Crie uma ordem primeiro.");
       navigate('orders');
     }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={(view) => {
          if (view === 'labeling') {
            handleLabelingStart();
          } else {
            navigate(view);
          }
        }} />;
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <PackingOrderForm onClose={() => navigate('dashboard')} />;
      case 'labeling':
        return activeOrder ? (
          <LabelingStation activeOrder={activeOrder} onBack={() => navigate('dashboard')} />
        ) : (
          <div className="flex items-center justify-center h-full">A carregar...</div>
        );
      case 'settings':
        return <Settings onBack={() => navigate('dashboard')} />;
      case 'help':
        return <HelpManual onClose={() => navigate('dashboard')} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      {/* Top Navigation Bar */}
      <div className={`bg-slate-900 text-white flex items-center px-4 shadow-md shrink-0 z-50 ${currentView !== 'dashboard' ? 'h-14' : 'h-12 bg-slate-900/95'}`}>
        {currentView !== 'dashboard' ? (
          <button 
            onClick={() => navigate('dashboard')} 
            className="flex items-center gap-2 hover:bg-slate-800 px-3 py-1.5 rounded transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
        ) : (
           <span className="font-bold text-lg tracking-tight px-2 text-slate-100 uppercase">Gestor de Etiquetagem</span>
        )}

        <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-200 transition-colors"
           >
             <Globe className="w-3 h-3" />
             <span className="uppercase font-bold">{language}</span>
           </button>
           <div className="hidden sm:flex items-center gap-2">
             <span>{t('common.systemReady')}</span>
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
         <p className="text-slate-500">A iniciar sistema...</p>
      </div>
    </div>;
  }

  return isAuthenticated ? <AuthenticatedApp /> : <Login />;
};

export default App;