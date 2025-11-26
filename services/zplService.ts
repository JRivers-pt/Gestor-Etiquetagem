import { PackingOrder, Product, WeighingLog } from "../types";

export const zplService = {
  generateLabel: (order: PackingOrder, product: Product, log: WeighingLog): string => {
    let zpl = `^XA^PW800^LL1200^CI28`; 
    zpl += `^FO50,50^A0N,40,40^FDGestor de Etiquetagem^FS`;
    zpl += `^FO50,120^A0N,60,60^FD${product.description.substring(0, 25)}^FS`;
    zpl += `^FO50,280^A0N,40,40^FDPESO LIQUIDO (Kg)^FS`;
    zpl += `^FO400,260^A0N,150,120^FD${log.weight.toFixed(3)}^FS`;
    zpl += `^FO50,450^A0N,30,30^FDLote: ${order.batchNumber}^FS`;
    zpl += `^FO400,450^A0N,30,30^FDValidade: ${order.expiryDate}^FS`;
    const barcodeData = `01${product.externalCode}10${order.batchNumber}310${Math.floor(log.weight * 100)}`;
    zpl += `^FO100,600^BCN,150,Y,N,N^FD${barcodeData}^FS`;
    zpl += `^XZ`;
    return zpl;
  },
  generatePalletLabel: (order: PackingOrder, product: Product, totalWeight: number, count: number): string => {
    let zpl = `^XA^PW800^LL1200^CI28`;
    zpl += `^FO50,50^A0N,60,60^FDPALETE COMPLETA^FS`;
    zpl += `^FO50,150^A0N,40,40^FD${product.description}^FS`;
    zpl += `^FO50,300^A0N,40,40^FDQtd Caixas: ${count}^FS`;
    zpl += `^FO50,400^A0N,40,40^FDPeso Total: ${totalWeight.toFixed(3)} Kg^FS`;
    zpl += `^XZ`;
    return zpl;
  },
  downloadZpl: (zplContent: string, filename: string) => {
    const blob = new Blob([zplContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); window.URL.revokeObjectURL(url);
  }
};