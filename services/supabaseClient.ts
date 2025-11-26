import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'labelmaster_supabase_url';
const STORAGE_KEY_KEY = 'labelmaster_supabase_key';

const getStoredConfig = () => {
  // CORREÇÃO: Usamos import.meta.env em vez de process.env para Vite
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || '',
    key: localStorage.getItem(STORAGE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

const config = getStoredConfig();

// Fallback seguro se não houver config, para a app não rebentar
const safeUrl = config.url && config.url.startsWith('http') ? config.url : 'https://placeholder.supabase.co';
const safeKey = config.key || 'placeholder';

// Create a single supabase client
export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const updateCloudConfig = (url: string, key: string) => {
  localStorage.setItem(STORAGE_KEY_URL, url);
  localStorage.setItem(STORAGE_KEY_KEY, key);
  // Reload to re-initialize the client
  window.location.reload();
};

export const getCurrentConfig = () => getStoredConfig();

export const isCloudEnabled = () => {
  const { url, key } = getStoredConfig();
  return url.length > 0 && key.length > 0 && url !== 'https://placeholder.supabase.co';
};