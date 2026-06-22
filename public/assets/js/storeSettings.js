
// public/assets/js/storeSettings.js
const ENV = window.ENV || {};
const USE_MOCK_API = ENV.USE_MOCK_API === true || ENV.USE_MOCK_API === 'true';

// Lazy load supabase
let supabaseClient = null;
async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  try {
    if (window.supabase) {
      supabaseClient = window.supabase;
      return supabaseClient;
    }
  } catch (e) {
    console.log('Supabase not available');
  }
  return null;
}

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
    const supabase = await getSupabase();
    if (!supabase) {
      console.info('Supabase not initialized, using defaults');
      return;
    }

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
    console.warn('Could not load store settings (using defaults):', e);
    // Silently continue with default theme
  }
}
