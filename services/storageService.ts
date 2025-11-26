import { Product, PackingOrder, HardwareConfig } from '../types';

const STORAGE_KEYS = { PRODUCTS: 'labelmaster_products', ORDERS: 'labelmaster_orders', HARDWARE: 'labelmaster_hardware' };
const INITIAL_PRODUCTS: Product[] = [
  { id: 16, code: '00174', description: 'Aba Novilho S/ Osso', variety: 'Standard', externalCode: '00174', origin: 'Portugal' },
  { id: 15, code: '00024', description: 'Aba Novilho c/ osso', variety: 'Standard', externalCode: '00024', origin: 'Portugal' },
];
const DEFAULT_HARDWARE: HardwareConfig = { scaleBrand: 'Generic', printerType: 'PDF' };

export const storageService = {
  getProducts: (): Product[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch { return INITIAL_PRODUCTS; }
  },
  saveProducts: (products: Product[]) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)),
  getOrders: (): PackingOrder[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },
  saveOrders: (orders: PackingOrder[]) => localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)),
  saveOrder: (order: PackingOrder) => {
    const orders = storageService.getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) orders[existingIndex] = order; else orders.push(order);
    storageService.saveOrders(orders);
  },
  getHardwareConfig: (): HardwareConfig => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HARDWARE);
      return stored ? JSON.parse(stored) : DEFAULT_HARDWARE;
    } catch { return DEFAULT_HARDWARE; }
  },
  saveHardwareConfig: (config: HardwareConfig) => localStorage.setItem(STORAGE_KEYS.HARDWARE, JSON.stringify(config)),
  exportData: (): string => {
    return JSON.stringify({
      products: storageService.getProducts(),
      orders: storageService.getOrders(),
      hardware: storageService.getHardwareConfig()
    }, null, 2);
  },
  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) storageService.saveProducts(data.products);
      if (data.orders) storageService.saveOrders(data.orders);
      if (data.hardware) storageService.saveHardwareConfig(data.hardware);
      return true;
    } catch { return false; }
  }
};