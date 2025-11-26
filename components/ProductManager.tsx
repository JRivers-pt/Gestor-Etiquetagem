import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Button, Input, Card } from './UIComponents';
import { Search, Plus, Trash2, Edit2, Sparkles, X, Loader2 } from 'lucide-react';
import { enhanceProductDescription } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { useLanguage } from '../contexts/LanguageContext';
import { cloudService } from '../services/cloudService';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    const load = async () => {
       const cloudProds = await cloudService.fetchProducts();
       if (cloudProds) {
         setProducts(cloudProds);
       } else {
         setProducts(storageService.getProducts());
       }
    };
    load();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      storageService.saveProducts(products);
    }
  }, [products]);

  const filteredProducts = products.filter(p => 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.includes(searchTerm)
  );

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
  };

  const handleNew = () => {
    setEditingId(-1);
    setFormData({ code: '', description: '', variety: '', origin: 'Portugal', externalCode: '' });
  };

  const handleDemoData = () => {
    setFormData({ 
      code: 'LMB-001', 
      description: 'Lombo de Porco Preto', 
      variety: 'Premium', 
      origin: 'Portugal', 
      externalCode: '560123456' 
    });
  };

  const handleSave = () => {
    if (editingId === -1) {
      const newProduct = { ...formData, id: Date.now() } as Product;
      setProducts([...products, newProduct]);
    } else {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
    }
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm(t('products.deleteConfirm'))) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAiEnhance = async () => {
    if (!formData.description) return;
    setIsEnhancing(true);
    const enhanced = await enhanceProductDescription(
      formData.description, 
      formData.variety || '', 
      formData.origin || '',
      language
    );
    setFormData(prev => ({ ...prev, description: enhanced }));
    setIsEnhancing(false);
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('products.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-accent/50 focus:outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNew} variant="success">
            <Plus className="w-4 h-4 mr-2" /> {t('common.new')}
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar p-2">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-l-md">{t('products.code')}</th>
                <th className="px-4 py-3 font-semibold">{t('products.description')}</th>
                <th className="px-4 py-3 font-semibold">{t('products.variety')}</th>
                <th className="px-4 py-3 font-semibold rounded-r-md text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 font-mono text-slate-600">{product.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{product.description}</td>
                  <td className="px-4 py-3 text-slate-600">{product.variety}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" className="px-2 py-1 h-8" onClick={() => handleEdit(product)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="danger" className="px-2 py-1 h-8" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingId !== null && (
        <div className="w-96 bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-lg text-slate-800">
              {editingId === -1 ? t('products.newProduct') : t('products.editProduct')}
            </h2>
            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-4 flex-1 overflow-auto">
             {editingId === -1 && (
               <Button variant="ghost" onClick={handleDemoData} className="mb-2 text-xs border border-dashed border-slate-300">
                 ✨ Demo Data
               </Button>
             )}
             <div className="grid grid-cols-2 gap-4">
                <Input 
                  label={t('products.internalCode')}
                  value={formData.code || ''} 
                  onChange={e => setFormData({...formData, code: e.target.value})}
                />
                 <Input 
                  label={t('products.externalCode')}
                  value={formData.externalCode || ''} 
                  onChange={e => setFormData({...formData, externalCode: e.target.value})}
                />
             </div>

             <div className="relative">
                <Input 
                  label={t('products.description')} 
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="pr-10"
                />
                <button 
                  onClick={handleAiEnhance}
                  disabled={isEnhancing}
                  className="absolute right-2 top-8 text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
                  title={t('products.aiEnhance')}
                >
                  {isEnhancing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
             </div>

             <Input 
                label={t('products.variety')} 
                value={formData.variety || ''} 
                onChange={e => setFormData({...formData, variety: e.target.value})}
             />
             
             <Input 
                label={t('products.origin')} 
                value={formData.origin || ''} 
                onChange={e => setFormData({...formData, origin: e.target.value})}
             />
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditingId(null)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </div>
      )}
    </div>
  );
};