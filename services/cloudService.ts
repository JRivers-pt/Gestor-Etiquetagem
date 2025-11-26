import { PackingOrder, Product } from "../types";
import { supabase } from "./supabaseClient";
import { storageService } from "./storageService";

export const cloudService = {
  checkConnection: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('products').select('count').limit(1).single();
      return !error;
    } catch { return false; }
  },
  syncOrders: async (orders: PackingOrder[]): Promise<any> => {
    if (!orders.length) return;
    try {
      await supabase.from('packing_orders').upsert(orders.map(o => ({
        order_number: o.orderNumber, status: o.status, date: o.date,
        target_weight: o.targetWeight, tolerance: o.tolerance,
        customer_doc: o.customerDoc, batch_number: o.batchNumber,
        expiry_date: o.expiryDate, product_id: o.productId
      })), { onConflict: 'order_number' });
    } catch (e) { console.error(e); }
  },
  fetchProducts: async (): Promise<Product[] | null> => {
    try {
      const { data } = await supabase.from('products').select('*');
      if (data) {
        const products = data.map((p: any) => ({
            id: p.id, code: p.code, description: p.description,
            variety: p.variety, externalCode: p.external_code, origin: p.origin
        }));
        storageService.saveProducts(products);
        return products;
      }
      return null;
    } catch { return null; }
  }
};