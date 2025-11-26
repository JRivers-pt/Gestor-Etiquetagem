export enum PackingStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  IN_PROGRESS = 'In Progress'
}

export interface Product {
  id: number;
  code: string;
  description: string;
  variety: string;
  externalCode: string;
  origin: string;
  unitPrice?: number;
}

export interface PackingOrder {
  id: number;
  orderNumber: string;
  date: string;
  status: PackingStatus;
  customerDoc: string;
  productId: number;
  targetWeight: number;
  tolerance: number;
  batchNumber: string;
  expiryDate: string;
  boxLabelType: string;
  palletLabelType: string;
  itemsPerPallet?: number;
  // Computed/Runtime stats
  currentTotalWeight: number;
  boxesCount: number;
}

export interface WeighingLog {
  id: string;
  orderId: number;
  weight: number;
  timestamp: string;
  sequenceNumber: number;
}

export interface LabelTemplate {
  id: string;
  name: string;
}

// Hardware Types
// CORREÇÃO: Definição do tipo ausente ScaleBrand
export type ScaleBrand = 'Mettler Toledo' | 'Bizerba' | 'Rice Lake' | 'Dibal' | 'Generic_Serial';

export type PrinterBrand = 'Zebra' | 'Epson' | 'Brother' | 'Dymo' | 'Generic_PDF';
export type ConnectionType = 'USB_Serial' | 'System_Driver';

export interface HardwareConfig {
  scaleBrand: ScaleBrand;
  printerBrand: PrinterBrand;
  connectionType: ConnectionType; // New field
  labelWidth: number; // mm (e.g. 100)
  labelHeight: number; // mm (e.g. 150)
}

// Auth Types
export interface Client {
  id: string;
  name: string;
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator';
  companyId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}