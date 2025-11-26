import React, { useState, useEffect } from 'react';
import { PackingOrder, PackingStatus, Product } from '../types';
import { Button, Input, Select, Card } from './UIComponents';
import { Save, X, Wand2 } from 'lucide-react';
import { suggestExpiryDate } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { storageService } from '../services/storageService';
import { cloudService } from '../services/cloudService';

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

  useEffect(() => {
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
    if (order.orderNumber && order.productId) {
       storageService.saveOrder(order as PackingOrder);
       await cloudService.syncOrders([order as PackingOrder]);
       onClose();
    } else {
      alert("Please fill required fields");
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

      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <Card title={t('orders.generalInfo')} className="bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label={t('orders.orderNumber')} value={order.orderNumber} disabled className="bg-white font-mono text-slate-900" />
              <Input type="date" label={t('orders.date')} value={order.date} onChange={e => setOrder({...order, date: e.target.value})} className="bg-white" />
              <Select label={t('orders.status')} value={order.status} onChange={e => setOrder({...order, status: e.target.value as PackingStatus})} className="bg-white">
                <option value={PackingStatus.OPEN}>{t('orders.statOpen')}</option>
                <option value={PackingStatus.IN_PROGRESS}>{t('orders.statInProgress')}</option>
                <option value={PackingStatus.CLOSED}>{t('orders.statClosed')}</option>
              </Select>
              <Input label={t('orders.customerDoc')} value={order.customerDoc} onChange={e => setOrder({...order, customerDoc: e.target.value})} className="bg-white" />
            </div>
          </Card>

          <Card title={t('orders.productDetails')} className="bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div className="col-span-1 md:col-span-2">
                  <Select label={t('orders.selectProduct')} onChange={handleProductChange} value={selectedProduct?.id || ''} className="bg-white">
                    <option value="">{t('orders.chooseProduct')}</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.description}</option>
                    ))}
                  </Select>
               </div>
            </div>
            
            {selectedProduct && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-md border border-slate-200">
                <div>
                  <label className="text-xs text-slate-500 uppercase">{t('products.description')}</label>
                  <p className="font-medium text-slate-800">{selectedProduct.description}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase">{t('products.variety')}</label>
                  <p className="font-medium text-slate-800">{selectedProduct.variety}</p>
                </div>
                 <div>
                  <label className="text-xs text-slate-500 uppercase">{t('products.origin')}</label>
                  <p className="font-medium text-slate-800">{selectedProduct.origin}</p>
                </div>
                 <div>
                  <label className="text-xs text-slate-500 uppercase">{t('products.code')}</label>
                  <p className="font-medium font-mono text-slate-800">{selectedProduct.code}</p>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title={t('orders.packagingParams')} className="bg-white shadow-sm">
               <div className="grid grid-cols-2 gap-4">
                  <Input label={t('orders.batch')} value={order.batchNumber} onChange={e => setOrder({...order, batchNumber: e.target.value})} className="bg-white" />
                  
                  <div className="flex items-end gap-2">
                    <Input 
                      type="date" 
                      label={t('orders.expiryDate')} 
                      value={order.expiryDate || ''} 
                      onChange={e => setOrder({...order, expiryDate: e.target.value})} 
                      className="flex-1 bg-white"
                    />
                    <Button 
                      variant="ghost" 
                      onClick={handleSuggestExpiry} 
                      disabled={!selectedProduct || loadingExpiry}
                      title={t('orders.suggestExpiry')}
                      className="mb-0.5"
                    >
                      <Wand2 className={`w-5 h-5 ${loadingExpiry ? 'animate-spin text-accent' : 'text-purple-500'}`} />
                    </Button>
                  </div>

                  <Input 
                    type="number" 
                    label={t('orders.targetWeight')}
                    value={order.targetWeight} 
                    onChange={e => setOrder({...order, targetWeight: parseFloat(e.target.value)})} 
                    className="bg-white"
                  />
                  <Input 
                    type="number" 
                    label={t('orders.tolerance')} 
                    value={order.tolerance} 
                    onChange={e => setOrder({...order, tolerance: parseFloat(e.target.value)})} 
                    className="bg-white"
                  />
               </div>
               <div className="mt-4 flex items-center gap-2">
                 <input type="checkbox" id="rounding" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                 <label htmlFor="rounding" className="text-sm font-medium text-slate-700">{t('orders.autoRound')}</label>
               </div>
               
               <div className="mt-4 pt-4 border-t border-slate-100">
                  <Input 
                    type="number"
                    label={t('Caixas p/ Palete')}
                    placeholder="Ex: 20"
                    value={order.itemsPerPallet || ''}
                    onChange={e => setOrder({...order, itemsPerPallet: parseInt(e.target.value)})}
                    className="bg-white"
                  />
               </div>
            </Card>

            <Card title={t('orders.labelConfig')} className="bg-white shadow-sm">
              <div className="space-y-4">
                 <Select label={t('orders.boxLabel')} value={order.boxLabelType} onChange={e => setOrder({...order, boxLabelType: e.target.value})} className="bg-white">
                    <option value="STD">Standard 100x150</option>
                    <option value="SMALL">Compact 50x25</option>
                    <option value="RETAIL">Retail Fancy</option>
                 </Select>
                 <Select label={t('orders.palletLabel')} value={order.palletLabelType} onChange={e => setOrder({...order, palletLabelType: e.target.value})} className="bg-white">
                    <option value="STD">Pallet GS1</option>
                    <option value="NONE">None</option>
                 </Select>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};