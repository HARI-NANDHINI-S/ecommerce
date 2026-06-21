// supabase/functions/store-settings.js
// Edge Function that returns current store settings (branding, theme, payment mode)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(_req, res) {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();
    if (error) throw error;
    // expose only public fields
    const publicSettings = {
      store_name: data.store_name,
      store_logo_url: data.store_logo_url,
      currency: data.currency,
      public_theme: data.public_theme,
      public_site_url: data.public_site_url,
    };
    return res.status(200).json(publicSettings);
  } catch (e) {
    console.error('store-settings error', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
