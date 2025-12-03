import React, { useState, useEffect } from 'react';
import { PackingOrder, PackingStatus, Product } from '../types';
import { Button, Input, Select, Card } from './UIComponents';
import { Save, X, Wand2, Package, Calendar, Weight, Hash, FileText, Box, Layers } from 'lucide-react';
import { suggestExpiryDate } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { storageService } from '../services/storageService';
import { cloudService } from '../services/cloudService';
import { useAuth } from '../contexts/AuthContext';

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
    boxLabelType: 'STD',
    palletLabelType: 'STD',
    itemsPerPallet: 20
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [loadingExpiry, setLoadingExpiry] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const loadedProducts = storageService.getProducts();
    setProducts(loadedProducts);
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prod = products.find(p => p.id === parseInt(e.target.value));
    setSelectedProduct(prod);
    setOrder(prev => ({ ...prev, productId: prod?.id }));
  };

  const handleSuggestExpiry = async () => {
    if (!selectedProduct) return;
    setLoadingExpiry(true);
    try {
      const days = await suggestExpiryDate(selectedProduct.description, language);
      const date = new Date();
      date.setDate(date.getDate() + days);
      setOrder(prev => ({ ...prev, expiryDate: date.toISOString().split('T')[0] }));
    } catch (error) {
      console.error('Error suggesting expiry date:', error);
    } finally {
      setLoadingExpiry(false);
    }
  };

  const handleDemo = () => {
    const demoProduct = products[0];
    setSelectedProduct(demoProduct);
    setOrder(prev => ({
      ...prev,
      productId: demoProduct?.id,
      batchNumber: `L-${Math.floor(Math.random() * 10000)}`,
      targetWeight: 5.0,
      tolerance: 5,
      expiryDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      customerDoc: 'CLIENTE-VIP-001',
      itemsPerPallet: 20
    }));
  };

  const handleSaveOrder = async () => {
    const companyId = user?.companyId;

    if (!order.orderNumber || !order.productId || !companyId) {
      alert(t('orders.fillRequired') || 'Por favor preencha todos os campos obrigatórios');
      return;
    }

    if (!order.targetWeight || order.targetWeight <= 0) {
      alert(t('orders.invalidWeight') || 'Por favor insira um peso alvo válido');
      return;
    }

    const finalOrder: PackingOrder = {
      id: Date.now(),
      orderNumber: order.orderNumber,
      date: order.date || new Date().toISOString().split('T')[0],
      status: order.status || PackingStatus.OPEN,
      customerDoc: order.customerDoc || '',
      productId: order.productId,
      targetWeight: order.targetWeight,
      tolerance: order.tolerance || 5,
      batchNumber: order.batchNumber || '',
      expiryDate: order.expiryDate || '',
      boxLabelType: order.boxLabelType || 'STD',
      palletLabelType: order.palletLabelType || 'STD',
      itemsPerPallet: order.itemsPerPallet || 20,
      currentTotalWeight: 0,
      boxesCount: 0,
      companyId: companyId
    };

    try {
      storageService.saveOrder(finalOrder);
      await cloudService.syncOrders([finalOrder]);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
      alert(t('orders.saveError') || 'Erro ao guardar ordem');
    }
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {t('orders.title') || 'Ordem de Embalamento'} #{order.orderNumber}
          </h1>
          <p className="text-sm text-slate-500">
            {t('orders.subtitle') || 'Criar ou modificar ordem'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={handleDemo} 
            className="text-purple-600 bg-purple-50 hover:bg-purple-100"
          >
            ✨ Demo
          </Button>
          <Button variant="primary" onClick={handleSaveOrder}>
            <Save className="w-4 h-4 mr-2" />
            {t('common.save') || 'Guardar'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            {t('common.cancel') || 'Cancelar'}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Informações Básicas */}
          <Card title={t('orders.basicInfo') || '📋 Informações Básicas'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t('orders.orderNumber') || 'Número da Ordem'}
                value={order.orderNumber}
                onChange={(e) => setOrder(prev => ({ ...prev, orderNumber: e.target.value }))}
                placeholder="PO-2025-XXX"
                disabled
              />
              
              <Input
                label={t('orders.date') || 'Data'}
                type="date"
                value={order.date}
                onChange={(e) => setOrder(prev => ({ ...prev, date: e.target.value }))}
              />
              
              <Select
                label={t('orders.status') || 'Estado'}
                value={order.status}
                onChange={(e) => setOrder(prev => ({ ...prev, status: e.target.value as PackingStatus }))}
              >
                <option value={PackingStatus.OPEN}>Aberta</option>
                <option value={PackingStatus.IN_PROGRESS}>Em Progresso</option>
                <option value={PackingStatus.CLOSED}>Fechada</option>
              </Select>
            </div>
          </Card>

          {/* Produto */}
          <Card 
            title={t('orders.productInfo') || '📦 Produto'}
            action={
              selectedProduct && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestExpiry}
                  isLoading={loadingExpiry}
                  className="text-purple-600"
                >
                  <Wand2 className="w-4 h-4 mr-1" />
                  {t('orders.suggestExpiry') || 'Sugerir Validade'}
                </Button>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('orders.product') || 'Produto *'}
                value={selectedProduct?.id || ''}
                onChange={handleProductChange}
              >
                <option value="">Selecione um produto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.description} ({p.variety})
                  </option>
                ))}
              </Select>

              {selectedProduct && (
                <div className="p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">Detalhes do Produto</p>
                  <p className="text-sm font-medium text-slate-800">{selectedProduct.description}</p>
                  <p className="text-xs text-slate-600">
                    Variedade: {selectedProduct.variety} | Origem: {selectedProduct.origin}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Cliente e Lote */}
          <Card title={t('orders.customerBatch') || '👤 Cliente e Lote'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t('orders.customerDoc') || 'Documento Cliente'}
                value={order.customerDoc}
                onChange={(e) => setOrder(prev => ({ ...prev, customerDoc: e.target.value }))}
                placeholder="CLIENTE-XXX-001"
              />
              
              <Input
                label={t('orders.batchNumber') || 'Número de Lote *'}
                value={order.batchNumber}
                onChange={(e) => setOrder(prev => ({ ...prev, batchNumber: e.target.value }))}
                placeholder="L-XXXX"
              />
              
              <Input
                label={t('orders.expiryDate') || 'Data de Validade'}
                type="date"
                value={order.expiryDate}
                onChange={(e) => setOrder(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </Card>

          {/* Peso e Tolerância */}
          <Card title={t('orders.weightTolerance') || '⚖️ Peso e Tolerância'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('orders.targetWeight') || 'Peso Alvo (kg) *'}
                type="number"
                step="0.01"
                value={order.targetWeight}
                onChange={(e) => setOrder(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) || 0 }))}
                placeholder="5.00"
              />
              
              <Input
                label={t('orders.tolerance') || 'Tolerância (g)'}
                type="number"
                value={order.tolerance}
                onChange={(e) => setOrder(prev => ({ ...prev, tolerance: parseInt(e.target.value) || 5 }))}
                placeholder="5"
              />
            </div>
            
            {order.targetWeight > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <Weight className="w-4 h-4 inline mr-1" />
                  Peso Aceitável: {(order.targetWeight - (order.tolerance || 0) / 1000).toFixed(3)} kg - {(order.targetWeight + (order.tolerance || 0) / 1000).toFixed(3)} kg
                </p>
              </div>
            )}
          </Card>

          {/* Configuração de Etiquetas */}
          <Card title={t('orders.labels') || '🏷️ Etiquetas'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={t('orders.boxLabelType') || 'Tipo de Etiqueta Caixa'}
                value={order.boxLabelType}
                onChange={(e) => setOrder(prev => ({ ...prev, boxLabelType: e.target.value }))}
              >
                <option value="STD">Standard</option>
                <option value="EXPORT">Exportação</option>
                <option value="RETAIL">Retalho</option>
              </Select>
              
              <Select
                label={t('orders.palletLabelType') || 'Tipo de Etiqueta Palete'}
                value={order.palletLabelType}
                onChange={(e) => setOrder(prev => ({ ...prev, palletLabelType: e.target.value }))}
              >
                <option value="STD">Standard</option>
                <option value="EXPORT">Exportação</option>
                <option value="GS1">GS1</option>
              </Select>
              
              <Input
                label={t('orders.itemsPerPallet') || 'Caixas por Palete'}
                type="number"
                value={order.itemsPerPallet}
                onChange={(e) => setOrder(prev => ({ ...prev, itemsPerPallet: parseInt(e.target.value) || 20 }))}
                placeholder="20"
              />
            </div>
          </Card>

          {/* Resumo */}
          <Card title={t('orders.summary') || '📊 Resumo'}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500 mb-1">Estado</p>
                <p className="text-lg font-bold text-slate-800">{order.status}</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500 mb-1">Peso Alvo</p>
                <p className="text-lg font-bold text-slate-800">{order.targetWeight} kg</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500 mb-1">Tolerância</p>
                <p className="text-lg font-bold text-slate-800">±{order.tolerance} g</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500 mb-1">Caixas/Palete</p>
                <p className="text-lg font-bold text-slate-800">{order.itemsPerPallet}</p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
