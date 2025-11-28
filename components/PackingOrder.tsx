import React, { useState, useEffect } from 'react';
import { PackingOrder, PackingStatus, Product } from '../types';
import { Button, Input, Select, Card } from './UIComponents';
import { Save, X, Wand2 } from 'lucide-react';
import { suggestExpiryDate } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { storageService } from '../services/storageService';
import { cloudService } from '../services/cloudService';
import { useAuth } from '../contexts/AuthContext'; // <--- 1. IMPORTAR CONTEXTO DE AUTENTICAÇÃO

interface PackingOrderProps {
  onClose: () => void;
  products?: Product[]; 
}

export const PackingOrderForm: React.FC<PackingOrderProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<Partial<PackingOrder>>({
    orderNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString().split('T')[0],
    status: PackingStatus.OPEN,
    targetWeight: 0,
    tolerance: 5,
    customerDoc: '',
    batchNumber: '',
    currentTotalWeight: 0,
    boxesCount: 0,
    palletLabelType: 'STD',
    boxLabelType: 'STD'
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [loadingExpiry, setLoadingExpiry] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth(); // <--- 2. OBTER O USER LOGADO (ASSUMINDO QUE TEM companyId)

  useEffect(() => {
    // Poderá querer sincronizar a lista de produtos aqui com cloudService.fetchProducts
    setProducts(storageService.getProducts());
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prod = products.find(p => p.id === parseInt(e.target.value));
    setSelectedProduct(prod);
    setOrder(prev => ({ ...prev, productId: prod?.id }));
  };

  const handleSuggestExpiry = async () => {
    if (!selectedProduct) return;
    setLoadingExpiry(true);
    const days = await suggestExpiryDate(selectedProduct.description, language);
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    setOrder(prev => ({ ...prev, expiryDate: date.toISOString().split('T')[0] }));
    setLoadingExpiry(false);
  };

  const handleDemo = () => {
    setOrder(prev => ({
        ...prev,
        batchNumber: `L-${Math.floor(Math.random() * 10000)}`,
        targetWeight: 5.00,
        tolerance: 50,
        expiryDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], 
        customerDoc: 'CLIENTE-VIP-001',
        itemsPerPallet: 20
    }));
  };

  const handleSaveOrder = async () => {
    // 3. Obter o companyId (do utilizador logado)
    const companyId = user?.companyId; 
    
    if (order.orderNumber && order.productId && companyId) { // 4. VERIFICAR SE companyId EXISTE
       
        // 5. Anexar o companyId à ordem antes de salvar/sincronizar
        const finalOrder: PackingOrder = {
            ...(order as PackingOrder),
            companyId: companyId, // <--- ADICIONAR companyId AQUI
        };
        
        // 6. Usar a ordem final
        storageService.saveOrder(finalOrder);
        await cloudService.syncOrders([finalOrder]);
        onClose();
    } else {
      alert("Please fill required fields (and ensure user is logged in)");
    }
  };

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t('orders.title')} #{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">{t('orders.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleDemo} className="text-purple-600 bg-purple-50 hover:bg-purple-100">✨ Demo</Button>
          <Button variant="primary" onClick={handleSaveOrder}><Save className="w-4 h-4 mr-2" /> {t('common.save')}</Button>
          <Button variant="secondary" onClick={onClose}><X className="w-4 h-4 mr-2" /> {t('common.cancel')}</Button>
        </div>
        
      </div>

      {/* Resto do código de renderização (inalterado) */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* ... */}
        </div>
      </div>
    </div>
  );
};