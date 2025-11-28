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

  // 1. CORREÇÃO: Adicionar company_id ao objeto upsert.
  syncOrders: async (orders: PackingOrder[]): Promise<any> => {
    if (!orders.length) return;
    try {
      await supabase.from('packing_orders').upsert(orders.map(o => ({
        order_number: o.orderNumber, 
        status: o.status, 
        date: o.date,
        target_weight: o.targetWeight, 
        tolerance: o.tolerance,
        customer_doc: o.customerDoc, 
        batch_number: o.batchNumber,
        expiry_date: o.expiryDate, 
        product_id: o.productId,
        // *** NOVO CAMPO DE SEGURANÇA ***
        company_id: o.companyId // Mapeia companyId (TS) para company_id (DB)
      })), { onConflict: 'order_number' });
    } catch (e) { console.error(e); }
  },

  // 2. CORREÇÃO: Mapear company_id do DB para companyId no TypeScript.
  fetchProducts: async (): Promise<Product[] | null> => {
    try {
      // O RLS já filtra por company_id, mas o campo precisa de ser retornado.
      const { data } = await supabase.from('products').select('*');
      if (data) {
        const products = data.map((p: any) => ({
            id: p.id, 
            code: p.code, 
            description: p.description,
            variety: p.variety, 
            externalCode: p.external_code, 
            origin: p.origin,
            // *** NOVO CAMPO DE SEGURANÇA ***
            companyId: p.company_id // Mapeia company_id (DB) para companyId (TS)
        }));
        storageService.saveProducts(products);
        return products;
      }
      return null;
    } catch { return null; }
  }
};