import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    common: { save: 'Gravar', cancel: 'Cancelar', delete: 'Remover', edit: 'Alterar', new: 'Novo', search: 'Pesquisar...', actions: 'Ações', back: 'Voltar ao Menu', close: 'Fechar', loading: 'A carregar...', systemReady: 'Sistema Pronto', language: 'Idioma', confirmDelete: 'Tem a certeza?', yes: 'Sim', no: 'Não', help: 'Ajuda' },
    dashboard: { title: 'Gestor de Etiquetagem', subtitle: 'Plataforma de Produção Industrial', products: 'Artigos', orders: 'Ordens Emb.', labeling: 'Etiquetagem', scaleConfig: 'Config. Balança', reports: 'Relatórios', settings: 'Configurações', logout: 'Sair' },
    products: { title: 'Gestão de Artigos', code: 'Código', description: 'Descrição', variety: 'Variedade', origin: 'Origem', internalCode: 'Cód. Interno', externalCode: 'Cód. Externo', newProduct: 'Novo Artigo', editProduct: 'Editar Artigo', deleteConfirm: 'Tem a certeza?', aiEnhance: 'Melhorar com IA', searchPlaceholder: 'Pesquisar artigos...' },
    orders: { title: 'Ordem de Embalamento', subtitle: 'Criar ou modificar ordem', generalInfo: 'Informação Geral', productDetails: 'Detalhes do Artigo', packagingParams: 'Parâmetros de Embalamento', labelConfig: 'Configuração de Etiquetas', orderNumber: 'Número', date: 'Data', status: 'Estado', customerDoc: 'Doc. Cliente', selectProduct: 'Selecionar Artigo', chooseProduct: '-- Escolha um Artigo --', batch: 'Lote', expiryDate: 'Data Validade', targetWeight: 'Peso Objetivo (kg)', tolerance: 'Tolerância (g)', autoRound: 'Arredonda Peso', boxLabel: 'Etiqueta Caixa', palletLabel: 'Etiqueta Palete', suggestExpiry: 'Sugerir Validade', statOpen: 'Aberto', statInProgress: 'Em Curso', statClosed: 'Fechado' },
    labeling: { closeStation: 'Fechar Posto', stats: 'Estatísticas', labels: 'Etiquetas', totalKg: 'Peso Total', target: 'Objetivo', settings: 'Definições', orderSettings: 'Dados da Ordem', netWeight: 'Peso Líquido (Kg)', stable: 'ESTÁVEL', unstable: 'INSTÁVEL', start: 'Iniciar', stop: 'Parar', print: 'Imprimir', recentLogs: 'Histórico Recente', seq: 'Seq', time: 'Hora', weight: 'Peso', noLogs: 'Sem registos', setValid: 'Definir Válido' },
    settings: { scaleBrand: 'Marca da Balança', printerType: 'Tipo de Impressora', hwDiagnostic: 'Diagnóstico de Hardware', cloudConfig: 'Configuração Cloud' }
  },
  en: {
    common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', new: 'New', search: 'Search...', actions: 'Actions', back: 'Back to Menu', close: 'Close', loading: 'Loading...', systemReady: 'System Ready', language: 'Language', confirmDelete: 'Are you sure?', yes: 'Yes', no: 'No', help: 'Help' },
    dashboard: { title: 'Labeling Manager', subtitle: 'Industrial Production Platform', products: 'Products', orders: 'Packing Orders', labeling: 'Labeling', scaleConfig: 'Scale Config', reports: 'Reports', settings: 'Settings', logout: 'Logout' },
    products: { title: 'Product Management', code: 'Code', description: 'Description', variety: 'Variety', origin: 'Origin', internalCode: 'Internal Code', externalCode: 'Ext. Code', newProduct: 'New Product', editProduct: 'Edit Product', deleteConfirm: 'Delete?', aiEnhance: 'Enhance with AI', searchPlaceholder: 'Search products...' },
    orders: { title: 'Packing Order', subtitle: 'Create or modify order', generalInfo: 'General Info', productDetails: 'Product Details', packagingParams: 'Packaging Params', labelConfig: 'Label Configuration', orderNumber: 'Order Number', date: 'Date', status: 'Status', customerDoc: 'Customer Doc', selectProduct: 'Select Product', chooseProduct: '-- Choose Product --', batch: 'Batch / Lot', expiryDate: 'Expiry Date', targetWeight: 'Target Weight', tolerance: 'Tolerance', autoRound: 'Auto-round', boxLabel: 'Box Label', palletLabel: 'Pallet Label', suggestExpiry: 'Suggest Expiry', statOpen: 'Open', statInProgress: 'In Progress', statClosed: 'Closed' },
    labeling: { closeStation: 'Close Station', stats: 'Statistics', labels: 'Labels', totalKg: 'Total Weight', target: 'Target', settings: 'Settings', orderSettings: 'Order Settings', netWeight: 'Net Weight (Kg)', stable: 'STABLE', unstable: 'UNSTABLE', start: 'Start', stop: 'Stop', print: 'Print', recentLogs: 'Recent Logs', seq: 'Seq', time: 'Time', weight: 'Weight', noLogs: 'No logs', setValid: 'Set Valid' },
    settings: { scaleBrand: 'Scale Brand', printerType: 'Printer Type', hwDiagnostic: 'Hardware Diagnostic', cloudConfig: 'Cloud Configuration' }
  }
};

interface LanguageContextType { language: Language; setLanguage: (lang: Language) => void; t: (path: string) => string; }
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[language];
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    return current;
  };
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};