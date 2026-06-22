// public/assets/js/app.js
// Main entry point – initializes Supabase client, loads store settings, starts router, and wires page‑specific modules

let supabase;

// Try to import Supabase client from CDN
async function initSupabase() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.40.0/+esm');
    const ENV = window.ENV || {};
    supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
    window.supabase = supabase;
    console.log('Supabase initialized');
    return true;
  } catch (error) {
    console.warn('Failed to initialize Supabase:', error);
    return false;
  }
}

// Import local modules
import { initRouter } from './router.js';
import { loadStoreSettings } from './storeSettings.js';
// Page modules – will be invoked after a page is loaded
import { initCart } from './cart.js';
import { initCheckout } from './checkout.js';
import { initProfile } from './profile.js';
import { initOrderDetails } from './orderHistory.js';
import { initToast } from './toast.js';

// Export supabase for other modules
export { supabase };

// Get environment from global window object (set in index.html)
const ENV = window.ENV || {};

// Make PayPal Client ID available globally for checkout
window.PAYPAL_CLIENT_ID = ENV.PAYPAL_CLIENT_ID;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initSupabase();
    await loadStoreSettings(); // fetch branding & theme from DB
  } catch (error) {
    console.warn('Setup error (app will continue with defaults):', error);
  }
  initRouter(); // start SPA router
});

// After each page is injected, the router dispatches a 'pageLoaded' event.
// Listen for that event and initialise page‑specific functionality.
window.addEventListener('pageLoaded', () => {
  const route = location.hash;
  switch (route) {
    case '#/cart':
      initCart();
      break;
    case '#/checkout':
      initCheckout();
      break;
    case '#/profile':
      initProfile();
      break;
    case '#/order':
      initOrderDetails();
      break;
    default:
      // No page‑specific init required
      break;
  }
});

// Global toast utility – expose for other modules
initToast();


