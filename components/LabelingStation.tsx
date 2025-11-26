import React, { useState, useEffect } from 'react';
import { PackingOrder, WeighingLog, HardwareConfig } from '../types';
import { Button, Card } from './UIComponents';
import { Play, Square, Printer, History, ArrowUp, ArrowDown, Usb, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SerialScaleService } from '../services/serialService';
import { storageService } from '../services/storageService';
import { printingService } from '../services/printingService'; // UPDATED IMPORT

interface LabelingStationProps {
  activeOrder: PackingOrder;
  onBack: () => void;
}

export const LabelingStation: React.FC<LabelingStationProps> = ({ activeOrder, onBack }) => {
  const [weight, setWeight] = useState(0.000);
  const [isStable, setIsStable] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<WeighingLog[]>([]);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { t } = useLanguage();
  const [serialService] = useState(() => new SerialScaleService());
  
  // Load Hardware Config with safe defaults
  const [hardware, setHardware] = useState<HardwareConfig>(() => {
    const saved = storageService.getHardwareConfig();
    return {
        ...saved,
        printerBrand: saved.printerBrand || 'Generic_PDF',
        connectionType: saved.connectionType || 'System_Driver',
        labelWidth: saved.labelWidth || 100,
        labelHeight: saved.labelHeight || 150
    };
  });

  // Pallet logic
  const itemsPerPallet = activeOrder.itemsPerPallet || 20;
  const currentBoxInPallet = (logs.length % itemsPerPallet); 
  const displayBoxCount = currentBoxInPallet === 0 && logs.length > 0 ? itemsPerPallet : currentBoxInPallet;

  const totalWeight = logs.reduce((acc, log) => acc + log.weight, 0);
  const count = logs.length;

  useEffect(() => {
    // Refresh hardware config in case user changed it in another tab
    const saved = storageService.getHardwareConfig();
    setHardware({
        ...saved,
        printerBrand: saved.printerBrand || 'Generic_PDF',
        connectionType: saved.connectionType || 'System_Driver'
    });
    
    return () => {
      serialService.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoSimulate && isRunning && !isConnected) {
      interval = setInterval(() => {
        const base = activeOrder.targetWeight > 0 ? activeOrder.targetWeight : 1.5;
        const noise = (Math.random() - 0.5) * 0.05;
        setWeight(parseFloat((base + noise).toFixed(3)));
        setIsStable(Math.random() > 0.3);
      }, 200);
    } else if (!autoSimulate && !isConnected) {
       setWeight(0.000);
    }
    return () => clearInterval(interval);
  }, [autoSimulate, isRunning, activeOrder.targetWeight, isConnected]);

  const handleConnectSerial = async () => {
     serialService.setBrand(hardware.scaleBrand);
     
     const connected = await serialService.connect();
     if (connected) {
       setIsConnected(true);
       setIsRunning(true);
       setAutoSimulate(false);
       
       serialService.startReading((data) => {
          setWeight(data.weight);
          setIsStable(data.isStable);
       });
     } else {
       alert("Não foi possível conectar à balança. Verifique se está a usar Chrome/Edge.");
     }
  };

  const handlePrint = async () => {
    if (!isRunning) return;
    
    // 1. Create Record
    const newLog: WeighingLog = {
      id: Math.random().toString(36).substr(2, 9),
      orderId: activeOrder.id,
      weight: weight,
      timestamp: new Date().toLocaleTimeString(),
      sequenceNumber: logs.length + 1
    };
    
    // 2. Update State
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    
    // 3. Get Product Info
    const products = storageService.getProducts();
    const product = products.find(p => p.id === activeOrder.productId);
    
    // 4. EXECUTE PRINT (Hybrid Logic)
    if (product) {
        await printingService.printLabel(hardware, activeOrder, product, newLog);
    }
    
    // 5. Reset Scale
    setIsStable(false);
    setTimeout(() => setIsStable(true), 500);

    // 6. Check Pallet Completion
    const isPalletComplete = updatedLogs.length % itemsPerPallet === 0;
    if (isPalletComplete) {
        // Optional: Trigger a pallet label here if needed
        alert(t('Palete Completa!')); 
    }
  };

  const handleSimulateWeight = () => {
     const base = activeOrder.targetWeight > 0 ? activeOrder.targetWeight : 1.250;
     setWeight(base);
     setIsStable(true);
  }

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="bg-white px-6 py-4 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
        <div>
           <h2 className="text-lg font-bold text-slate-800">
             {t('orders.title')} #{activeOrder.orderNumber} <span className="text-slate-400 font-normal mx-2">|</span> {activeOrder.date}
           </h2>
           <p className="text-slate-500 text-sm">
             Hardware: {hardware.scaleBrand} Scale | {hardware.printerBrand} ({hardware.connectionType === 'USB_Serial' ? 'Direct' : 'Driver'})
           </p>
        </div>
        <div className="flex gap-2">
          {!isConnected && SerialScaleService.isSupported() && (
            <Button variant="secondary" onClick={handleConnectSerial}>
              <Usb className="w-4 h-4 mr-2" /> Ligar {hardware.scaleBrand}
            </Button>
          )}
          <Button variant="secondary" onClick={onBack}>{t('labeling.closeStation')}</Button>
        </div>
      </div>

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        
        {/* Left Side: Stats */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card title={t('labeling.stats')} className="flex-none">
             <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-bold">{t('labeling.labels')}</div>
                  <div className="text-2xl font-mono font-bold text-accent">{count}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-bold">{t('labeling.totalKg')}</div>
                  <div className="text-2xl font-mono font-bold text-slate-800">{totalWeight.toFixed(3)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-bold">{t('labeling.target')}</div>
                  <div className="text-2xl font-mono font-bold text-slate-400">{activeOrder.targetWeight || '-'}</div>
                </div>
             </div>
             {/* Pallet Progress */}
             <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-800 flex items-center gap-1"><Package className="w-3 h-3"/> PALETE</span>
                    <span className="text-xs font-mono text-indigo-600">{displayBoxCount} / {itemsPerPallet}</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(displayBoxCount / itemsPerPallet) * 100}%` }}></div>
                </div>
             </div>
          </Card>

          <Card title={t('labeling.orderSettings')} className="flex-1">
            <div className="space-y-3 text-sm">
               <div className="flex justify-between border-b border-slate-100 pb-2">
                 <span className="text-slate-500">{t('orders.batch')}</span>
                 <span className="font-mono">{activeOrder.batchNumber || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-slate-100 pb-2">
                 <span className="text-slate-500">{t('orders.customerDoc')}</span>
                 <span>{activeOrder.customerDoc || 'General Stock'}</span>
               </div>
               <div className="flex justify-between border-b border-slate-100 pb-2">
                 <span className="text-slate-500">Protocol</span>
                 <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{hardware.scaleBrand}</span>
               </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Operations */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Weight Indicator */}
          <div className="bg-slate-900 rounded-xl p-8 text-center shadow-lg relative overflow-hidden group">
            <div className="absolute top-4 right-4 flex gap-2">
               <span className={`w-3 h-3 rounded-full ${isStable ? 'bg-green-500' : 'bg-red-500'}`}></span>
               <span className="text-xs text-slate-400 uppercase tracking-widest">{isStable ? t('labeling.stable') : t('labeling.unstable')}</span>
            </div>
            
            <div className="text-xs text-slate-500 uppercase mb-2">{t('labeling.netWeight')}</div>
            <div className={`font-mono text-8xl font-bold tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] transition-colors ${isStable ? 'text-green-400' : 'text-red-400'}`}>
              {weight.toFixed(3)}
            </div>

            {/* Simulation Controls (Visible if not connected) */}
            {!isConnected && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => setWeight(w => Math.max(0, w - 0.1))} className="text-slate-600 hover:text-white p-1"><ArrowDown className="w-4 h-4"/></button>
                 <button onClick={handleSimulateWeight} className="text-slate-600 hover:text-white text-xs border border-slate-700 px-2 rounded">{t('labeling.setValid')}</button>
                 <button onClick={() => setWeight(w => w + 0.1)} className="text-slate-600 hover:text-white p-1"><ArrowUp className="w-4 h-4"/></button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 h-24">
             {!isRunning && !isConnected ? (
               <button 
                onClick={() => { setIsRunning(true); setAutoSimulate(true); }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md flex flex-col items-center justify-center gap-2 text-xl font-bold transition-all hover:scale-[1.02]"
               >
                 <Play className="w-8 h-8 fill-current" />
                 {t('labeling.start')} (Sim)
               </button>
             ) : (
               <button 
                onClick={() => { setIsRunning(false); setAutoSimulate(false); if(!isConnected) setWeight(0); }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md flex flex-col items-center justify-center gap-2 text-xl font-bold transition-all"
               >
                 <Square className="w-8 h-8 fill-current" />
                 {isConnected ? 'Desconectar' : t('labeling.stop')}
               </button>
             )}

             <button 
              onClick={handlePrint}
              disabled={!isRunning || weight <= 0}
              className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg shadow-md flex flex-col items-center justify-center gap-2 text-xl font-bold transition-all active:scale-95"
             >
               <Printer className="w-8 h-8" />
               {hardware.printerBrand === 'Zebra' && hardware.connectionType === 'USB_Serial' 
                 ? 'Imprimir ZPL (USB)' 
                 : `Imprimir (${hardware.printerBrand})`}
             </button>
          </div>

          {/* History Log */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
             <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <History className="w-4 h-4 text-slate-500" />
               <span className="font-semibold text-sm text-slate-700">{t('labeling.recentLogs')}</span>
             </div>
             <div className="flex-1 overflow-auto p-0">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                   <tr>
                     <th className="px-4 py-2">{t('labeling.seq')}</th>
                     <th className="px-4 py-2">{t('labeling.time')}</th>
                     <th className="px-4 py-2 text-right">{t('labeling.weight')} (kg)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {logs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50">
                       <td className="px-4 py-2 text-slate-500">#{log.sequenceNumber}</td>
                       <td className="px-4 py-2 text-slate-600">{log.timestamp}</td>
                       <td className="px-4 py-2 text-right font-mono font-bold text-slate-800">{log.weight.toFixed(3)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};