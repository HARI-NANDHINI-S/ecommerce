
// public/assets/js/storeSettings.js
import { supabase } from './app.js';
import { showToast } from './toast.js';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function loadStoreSettings() {
  if (USE_MOCK_API) {
    console.info('[MOCK] Loading static store settings');
    const data = {
      store_name: 'Demo Store',
      store_logo_url: '/assets/images/logo.png',
      enable_dark_mode: false,
    };
    document.title = data.store_name;
    const logoEl = document.getElementById('store-logo');
    if (logoEl) logoEl.src = data.store_logo_url;
    return;
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();
    if (error) throw error;
    if (data.store_name) document.title = data.store_name;
    const logoEl = document.getElementById('store-logo');
    if (logoEl && data.store_logo_url) logoEl.src = data.store_logo_url;
    if (data.enable_dark_mode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  } catch (e) {
    console.error('Failed to load store settings:', e);
    showToast('Could not load store settings', 'error');
  }
}
