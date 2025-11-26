import { PackingOrder, Product, WeighingLog, HardwareConfig } from "../types";

// Helper to write to Serial Port (Zebra Direct)
const writeToSerial = async (data: string) => {
  if (!('serial' in navigator)) {
    alert("Web Serial API not supported in this browser.");
    return;
  }
  try {
    const nav = navigator as any;
    const port = await nav.serial.requestPort();
    await port.open({ baudRate: 9600 });
    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.write(encoder.encode(data));
    writer.releaseLock();
    await port.close();
  } catch (err) {
    console.error("Print Error:", err);
    alert("Failed to send to printer. Check connection.");
  }
};

export const printingService = {
  // 1. GENERATOR: Create ZPL for Zebra
  generateZPL: (order: PackingOrder, product: Product, log: WeighingLog): string => {
    return `
^XA
^PW800
^LL1200
^FO50,50^A0N,40,40^FD${product.description.substring(0, 30)}^FS
^FO50,100^A0N,30,30^FD${product.variety} - ${product.origin}^FS
^FO50,200^GB700,0,3^FS
^FO50,220^A0N,40,40^FDLOTE: ${order.batchNumber}^FS
^FO400,220^A0N,40,40^FDVAL: ${order.expiryDate}^FS
^FO50,350^A0N,50,50^FDPESO LIQUIDO:^FS
^FO50,420^A0N,150,150^FD${log.weight.toFixed(3)} Kg^FS
^FO100,650^BCN,150,Y,N,N^FD01${product.externalCode}10${order.batchNumber}310${Math.floor(log.weight * 100)}^FS
^XZ`;
  },

  // 2. PREVIEWER: Get an image URL for the ZPL (using Labelary API with HTTPS)
  getZplPreviewUrl: (zplCode: string): string => {
    const cleanZpl = zplCode.replace(/\n/g, ''); 
    return `https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/${cleanZpl}`;
  },

  // 3. MAIN PRINT FUNCTION (Updated for Silent Printing)
  printLabel: async (config: HardwareConfig, order: PackingOrder, product: Product, log: WeighingLog) => {
    
    // STRATEGY A: ZEBRA DIRECT (USB)
    if (config.printerBrand === 'Zebra' && config.connectionType === 'USB_Serial') {
      const zpl = printingService.generateZPL(order, product, log);
      await writeToSerial(zpl);
      return;
    }

    // STRATEGY B: SILENT IFRAME PRINT (Browser, Epson, Brother, Dymo)
    const iframeId = 'print-iframe';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;

    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
        <html>
        <head>
          <style>
            @page { size: ${config.labelWidth}mm ${config.labelHeight}mm; margin: 0; }
            body { margin: 0; padding: 5mm; font-family: Arial, sans-serif; text-align: center; }
            .title { font-size: 16pt; font-weight: bold; margin-bottom: 5px; }
            .weight { font-size: 32pt; font-weight: bold; margin: 15px 0; }
            .meta { font-size: 10pt; border-top: 2px solid black; padding-top: 10px; display: flex; justify-content: space-between; }
            .barcode { margin-top: 15px; font-family: 'Courier New', monospace; font-size: 10pt; }
          </style>
        </head>
        <body>
          <div class="title">${product.description}</div>
          <div style="font-size: 10pt;">${product.variety} | ${product.origin}</div>
          
          <div class="weight">${log.weight.toFixed(3)} Kg</div>
          
          <div class="meta">
             <span>Lote: ${order.batchNumber}</span>
             <span>Val: ${order.expiryDate}</span>
          </div>

          <div class="barcode">
             ${product.externalCode}
             <br/>(Código de Barras aqui)
          </div>
          
          <script>
            // Automatically trigger print when loaded
            window.onload = function() {
              setTimeout(function() { 
                window.print();
              }, 500);
            }
          </script>
        </body>
        </html>
    `);
    doc.close();
    iframe.contentWindow?.focus();
  }
};