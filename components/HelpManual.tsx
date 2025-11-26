import React, { useState } from 'react';
import { Button } from './UIComponents';
import { Book, PlayCircle, Package, Printer, Wifi, ArrowLeft } from 'lucide-react';

interface HelpManualProps {
  onClose: () => void;
}

export const HelpManual: React.FC<HelpManualProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('inicio');

  const menuItems = [
    { id: 'inicio', label: 'Início Rápido', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'produtos', label: 'Criar Artigos', icon: <Package className="w-4 h-4" /> },
    { id: 'ordens', label: 'Ordens de Fabrico', icon: <Book className="w-4 h-4" /> },
    { id: 'etiquetagem', label: 'Posto de Etiquetagem', icon: <Printer className="w-4 h-4" /> },
    { id: 'cloud', label: 'Offline vs Cloud', icon: <Wifi className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo ao Gestor de Etiquetagem</h2>
            <p className="text-slate-600">Esta aplicação permite controlar o peso e etiquetagem de caixas em ambiente industrial. Funciona tanto online como offline.</p>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">Fluxo de Trabalho:</h3>
              <ol className="list-decimal list-inside space-y-3 text-blue-800">
                <li className="pl-2"><span className="font-semibold">Artigos:</span> Crie os produtos ou importe da Cloud.</li>
                <li className="pl-2"><span className="font-semibold">Ordens:</span> Abra uma nova Ordem de Embalamento para um artigo.</li>
                <li className="pl-2"><span className="font-semibold">Etiquetagem:</span> Vá para o posto de operação, pese as caixas e imprima.</li>
              </ol>
            </div>
          </div>
        );
      case 'produtos':
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-slate-800">Gestão de Artigos</h2>
            <p className="text-slate-600">No menu "Artigos", pode criar e gerir a base de dados dos produtos.</p>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                 <div className="bg-green-100 p-2 rounded text-green-700 font-bold text-xs">NOVO</div>
                 <p className="text-sm text-slate-700">Use o botão <strong>Novo</strong> para criar um artigo manualmente.</p>
              </div>
              <div className="flex items-start gap-3">
                 <div className="bg-purple-100 p-2 rounded text-purple-700 font-bold text-xs">IA ✨</div>
                 <p className="text-sm text-slate-700">Ao escrever a descrição, clique na "Varinha Mágica" para a Inteligência Artificial melhorar o texto automaticamente.</p>
              </div>
              <div className="flex items-start gap-3">
                 <div className="bg-slate-100 p-2 rounded text-slate-700 font-bold text-xs">EAN</div>
                 <p className="text-sm text-slate-700">Preencha o <strong>Código Externo</strong> para que o código de barras da etiqueta saia correto.</p>
              </div>
            </div>
          </div>
        );
      case 'ordens':
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-slate-800">Ordens de Embalamento</h2>
              <p className="text-slate-600">Antes de começar a trabalhar, é necessário criar uma Ordem (Lote de Produção).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                     <strong className="block text-slate-900 mb-1">Peso Alvo & Tolerância</strong>
                     <span className="text-sm text-slate-600">Defina o peso ideal da caixa (ex: 5.00kg). A tolerância define a margem de erro aceitável para o operador.</span>
                 </div>
                 <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                     <strong className="block text-slate-900 mb-1">Validade & Lote</strong>
                     <span className="text-sm text-slate-600">O sistema gera o Lote automaticamente. Pode usar a IA para sugerir a validade baseada no tipo de produto.</span>
                 </div>
              </div>
            </div>
          );
      case 'etiquetagem':
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-slate-800">Posto de Etiquetagem</h2>
              <p className="text-slate-600">É aqui que o operador trabalha. O ecrã está otimizado para ecrãs táteis.</p>
              
              <div className="space-y-4">
                {/* Aqui era onde estava o erro. Foi fechado corretamente. */}
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Printer className="w-5 h-5 text-yellow-700 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">Certifique-se de que a impressora está configurada nas Definições.</span>
                </div>
                {/* O seu conteúdo para Etiquetagem pode continuar aqui... */}
              </div>
            </div>
          );
      case 'cloud':
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-slate-800">Modo Offline vs Cloud</h2>
            <p className="text-slate-600">A aplicação foi desenhada para funcionar mesmo sem ligação à Internet (Modo Offline).</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 pl-4">
                <li><strong className="text-green-600">Online (Cloud):</strong> Os dados de Artigos e Ordens são sincronizados com o servidor central.</li>
                <li><strong className="text-orange-600">Offline (Local):</strong> As operações de etiquetagem continuam a funcionar. Os resultados são guardados localmente e enviados quando a ligação for restaurada.</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Book className="w-6 h-6 text-indigo-600" />
            Manual de Ajuda
          </h1>
          <Button variant="ghost" onClick={onClose} className="text-slate-500 hover:text-slate-800 p-2">
            X
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex flex-grow overflow-hidden">
          {/* Menu Lateral */}
          <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-4 border-t border-slate-200">
                <Button variant="link" onClick={onClose} className="text-slate-600 hover:text-slate-900 flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Fechar Ajuda
                </Button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-grow p-6 overflow-y-auto bg-white">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};