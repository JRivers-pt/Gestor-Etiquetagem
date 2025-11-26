import React, { useState, useEffect } from 'react';
import { Button, Card, Select, Input } from './UIComponents';
import { Download, Upload, Usb, Save, Cloud, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { storageService } from '../services/storageService';
import { SerialScaleService } from '../services/serialService';
import { updateCloudConfig, getCurrentConfig, isCloudEnabled } from '../services/supabaseClient';
import { HardwareConfig, ScaleBrand, PrinterBrand, ConnectionType } from '../types';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [debugData, setDebugData] = useState<string[]>([]);
  const [serialService] = useState(() => new SerialScaleService());
  const [isConnected, setIsConnected] = useState(false);
  
  // Load config, ensuring defaults for new fields to prevent crashes
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

  const [cloudConfig, setCloudConfig] = useState(getCurrentConfig());

  const handleSaveHardware = () => {
    storageService.saveHardwareConfig(hardware);
    alert(t('common.save') + " OK!");
  };

  const handleSaveCloud = () => {
    if (!cloudConfig.url.startsWith('https://')) {
      alert("O URL deve começar por https://");
      return;
    }
    updateCloudConfig(cloudConfig.url, cloudConfig.key);
  };

  const handleExport = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (storageService.importData(content)) {
        alert("Dados restaurados! Recarregando...");
        window.location.reload();
      } else {
        alert("Erro ao importar.");
      }
    };
    reader.readAsText(file);
  };

  const toggleSerialDebug = async () => {
    if (isConnected) {
      await serialService.disconnect();
      setIsConnected(false);
    } else {
      serialService.setBrand(hardware.scaleBrand);
      const connected = await serialService.connect();
      if (connected) {
        setIsConnected(true);
        serialService.startReading((data, rawLine) => {
           setDebugData(prev => [...prev.slice(-9), rawLine || `Weight: ${data.weight}`]);
        });
      }
    }
  };

  useEffect(() => {
    return () => { serialService.disconnect(); };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-6 py-4 shadow-sm border-b border-slate-200 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">{t('dashboard.settings')}</h1>
        <Button variant="secondary" onClick={onBack}>{t('common.close')}</Button>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6 overflow-auto">
        
        {/* Cloud Config */}
        <Card title={t('settings.cloudConfig')} className={`border-l-4 ${isCloudEnabled() ? 'border-l-green-500' : 'border-l-red-500'}`}>
           <div className="space-y-4">
             {!isCloudEnabled() && (
               <div className="bg-red-50 text-red-700 p-3 rounded flex items-center gap-2 text-sm">
                 <AlertTriangle className="w-4 h-4" />
                 Sistema Cloud Desligado. Configure o URL.
               </div>
             )}
             <div className="grid grid-cols-1 gap-4">
                <Input 
                  label="Supabase Project URL" 
                  value={cloudConfig.url}
                  onChange={e => setCloudConfig({...cloudConfig, url: e.target.value})}
                />
                <Input 
                  label="Supabase API Key (Public)" 
                  value={cloudConfig.key}
                  onChange={e => setCloudConfig({...cloudConfig, key: e.target.value})}
                />
             </div>
             <div className="flex justify-end">
                <Button onClick={handleSaveCloud} className="flex items-center gap-2">
                   <Cloud className="w-4 h-4" /> Gravar e Ligar Cloud
                </Button>
             </div>
           </div>
        </Card>

        {/* UPDATED: Hardware Configuration */}
        <Card title="Configuração de Hardware" className="border-l-4 border-l-purple-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scale Brand */}
              <Select 
                label={t('settings.scaleBrand')} 
                value={hardware.scaleBrand}
                onChange={e => setHardware({...hardware, scaleBrand: e.target.value as ScaleBrand})}
              >
                <option value="Generic">Genérica / Universal</option>
                <option value="Dibal">Dibal</option>
                <option value="Ipesa">Ipesa</option>
                <option value="Ruby">Ruby</option>
              </Select>

              {/* Printer Brand */}
              <Select 
                label={t('settings.printerType')}
                value={hardware.printerBrand}
                onChange={e => setHardware({...hardware, printerBrand: e.target.value as PrinterBrand})}
              >
                <option value="Generic_PDF">PDF / Impressora Escritório</option>
                <option value="Zebra">Zebra (Industrial ZPL)</option>
                <option value="Brother">Brother (Série QL/PT)</option>
                <option value="Dymo">Dymo (LabelWriter)</option>
                <option value="Epson">Epson (TM/ColorWorks)</option>
              </Select>

              {/* Connection Type */}
              <Select 
                label="Tipo de Conexão"
                value={hardware.connectionType}
                onChange={e => setHardware({...hardware, connectionType: e.target.value as ConnectionType})}
              >
                <option value="System_Driver">Driver Windows (Popup)</option>
                {hardware.printerBrand === 'Zebra' && (
                   <option value="USB_Serial">USB Direto (ZPL Raw)</option>
                )}
              </Select>

              {/* Dimensions */}
              <div className="flex gap-2">
                 <Input 
                   label="Largura (mm)" 
                   type="number" 
                   value={hardware.labelWidth} 
                   onChange={e => setHardware({...hardware, labelWidth: parseInt(e.target.value)})}
                 />
                 <Input 
                   label="Altura (mm)" 
                   type="number" 
                   value={hardware.labelHeight} 
                   onChange={e => setHardware({...hardware, labelHeight: parseInt(e.target.value)})}
                 />
              </div>
           </div>
           <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveHardware} className="flex items-center gap-2">
                 <Save className="w-4 h-4" /> {t('common.save')} Config
              </Button>
           </div>
        </Card>
        
        {/* Label Visualizer (Static Preview for now) */}
        <Card title="Visualização de Layout" className="border-l-4 border-l-indigo-500">
            <div className="flex gap-4">
               <div 
                 className="bg-white border-2 border-slate-800 p-4 rounded flex flex-col items-center justify-center relative shadow-lg"
                 style={{ width: '200px', height: '300px' }} // Approximate ratio for 100x150
               >
                   <div className="absolute top-2 left-2 text-[10px] font-bold">PREVIEW</div>
                   <div className="text-lg font-bold text-center leading-tight">PRODUTO DEMO</div>
                   <div className="text-sm text-slate-500 mb-4">Variedade Extra</div>
                   <div className="text-3xl font-mono font-bold">1.250 KG</div>
                   <div className="mt-4 w-32 h-8 bg-black"></div>
                   <div className="mt-1 text-[10px]">123456789</div>
               </div>
               <div className="flex-1 space-y-2">
                  <p className="text-sm text-slate-500">
                    O layout será adaptado automaticamente às dimensões: 
                    <span className="font-bold text-slate-800"> {hardware.labelWidth}mm x {hardware.labelHeight}mm</span>.
                  </p>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800">
                     <strong>Nota:</strong> Para impressoras Brother/Dymo, certifique-se que o papel correto está selecionado nas definições do Windows.
                  </div>
               </div>
            </div>
        </Card>

        {/* Diagnostics */}
        <Card title={t('settings.hwDiagnostic')} className="border-l-4 border-l-amber-500">
          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-center">
               <p className="text-sm text-slate-600">Testar conexão balança (Serial/USB).</p>
               <Button onClick={toggleSerialDebug} variant={isConnected ? "danger" : "success"} className="w-48">
                  <Usb className="w-4 h-4 mr-2" /> {isConnected ? "Desligar" : "Ligar & Testar"}
               </Button>
             </div>
             <div className="bg-slate-900 rounded-md p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto flex flex-col-reverse shadow-inner">
                {debugData.map((line, i) => (
                  <div key={i} className="border-b border-slate-800 pb-1 mb-1">{line}</div>
                ))}
             </div>
          </div>
        </Card>

        {/* Backup/Restore */}
        <Card title="Gestão de Dados" className="border-l-4 border-l-blue-500">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Backup Local
            </Button>
            <div className="relative">
              <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Button variant="secondary" className="flex items-center gap-2">
                <Upload className="w-4 h-4" /> Restaurar Backup
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};