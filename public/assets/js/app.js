// public/assets/js/app.js
// Main entry point – initializes Supabase client, loads store settings, starts router, and wires page‑specific modules

import { createClient } from '@supabase/supabase-js';
import { initRouter } from './router.js';
import { loadStoreSettings } from './storeSettings.js';
// Page modules – will be invoked after a page is loaded
import { initCart } from './cart.js';
import { initCheckout } from './checkout.js';
import { initProfile } from './profile.js';
import { initOrderDetails } from './orderHistory.js';
import { initAdminPanel } from './adminPanel.js';
import { initProductCard } from './productCard.js';
import { initToast } from './toast.js';

// Supabase client (public anon key, safe for client)
export const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadStoreSettings(); // fetch branding & theme from DB
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
    case '#/admin':
      initAdminPanel();
      break;
    case '#/product':
      initProductCard();
      break;
    default:
      // No page‑specific init required
      break;
  }
});

// Global toast utility – expose for other modules
initToast();
