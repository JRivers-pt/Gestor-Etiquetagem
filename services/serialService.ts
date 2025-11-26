import { ScaleBrand } from "../types";

export interface ScaleData { weight: number; unit: string; isStable: boolean; }

export class SerialScaleService {
  private port: any = null;
  private reader: any = null;
  private isReading = false;
  private currentBrand: ScaleBrand = 'Generic';

  static isSupported(): boolean { return 'serial' in navigator; }
  setBrand(brand: ScaleBrand) { this.currentBrand = brand; }

  async connect(): Promise<boolean> {
    try {
      if (!SerialScaleService.isSupported()) throw new Error('Web Serial API not supported');
      const nav = navigator as any;
      this.port = await nav.serial.requestPort();
      await this.port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
      return true;
    } catch (error) { return false; }
  }

  async disconnect() {
    this.isReading = false;
    if (this.reader) { await this.reader.cancel(); this.reader = null; }
    if (this.port) { await this.port.close(); this.port = null; }
  }

  async startReading(onData: (data: ScaleData, rawLine?: string) => void) {
    if (!this.port || !this.port.readable) return;
    this.isReading = true;
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();
    let buffer = '';

    try {
      while (this.isReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/\r\n|\r|\n/);
          if (lines.length > 0) buffer = lines.pop() || '';
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.length > 0) {
                const parsed = this.parseScaleString(cleanLine);
                if (parsed) onData(parsed, cleanLine);
                else onData({ weight: 0, unit: '', isStable: false }, cleanLine);
            }
          }
        }
      }
    } catch (error) { console.error(error); } finally { this.reader.releaseLock(); }
  }

  private parseScaleString(line: string): ScaleData | null {
    const genericMatch = line.match(/([+-]?\s*\d+[.,]\d+)/);
    if (!genericMatch) return null;
    let weight = parseFloat(genericMatch[1].replace(/\s/g, '').replace(',', '.'));
    if (isNaN(weight)) return null;
    return { weight, unit: 'kg', isStable: !line.includes('?') && !line.includes('U') };
  }
}