// public/assets/js/api.js
// Wrapper around Supabase client to call Edge Functions and basic DB queries.

let supabase = null;

// Lazy load supabase
async function getSupabase() {
  if (supabase) return supabase;
  if (window.supabase) {
    supabase = window.supabase;
    return supabase;
  }
  throw new Error('Supabase not initialized');
}

const ENV = window.ENV || {};
const USE_MOCK_API = ENV.USE_MOCK_API === true || ENV.USE_MOCK_API === 'true';

// Helper to call a Supabase Edge Function (V1) with JSON payload
async function callEdgeFunction(functionName, payload = {}) {
  if (USE_MOCK_API) {
    const mockResponses = {
      'create-order': { orderId: 'MOCK_ORDER_123', paypalOrderId: 'MOCK_PAYPAL_ORDER_123' },
      'verify-payment': { success: true },
      // add more mock responses as needed
    };
    console.info('[MOCK] Edge function →', functionName, payload);
    return mockResponses[functionName] ?? {};
  }
  const url = `${ENV.SUPABASE_URL}/functions/v1/${functionName}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiKey: ENV.SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Edge function ${functionName} failed: ${err}`);
  }
  return response.json();
}

// Store Settings – fetch from a simple table via Supabase client
export async function getStoreSettings() {
  const sb = await getSupabase();
  const { data, error } = await sb.from('store_settings').select('*').single();
  if (error) throw error;
  return data;
}

export async function updateStoreSettings(patch) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('store_settings').update(patch).eq('id', 1).single();
  if (error) throw error;
  return data;
}

// Products
export async function getProducts() {
  const sb = await getSupabase();
  const { data, error } = await sb.from('products').select('*');
  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

// Orders – use edge function to create an order (server‑side logic, payment, etc.)
export async function createOrder(orderPayload) {
  return callEdgeFunction('create-order', orderPayload);
}

// Verify payment – called after PayPal redirects back
export async function verifyPayment(verificationPayload) {
  return callEdgeFunction('verify-payment', verificationPayload);
}

// Admin utilities – placeholder wrappers
export async function adminGetAllOrders() {
  return callEdgeFunction('admin-get-all-orders');
}

export async function adminUpdateOrderStatus(orderId, status) {
  return callEdgeFunction('update-order-status', { orderId, status });
}

// Export helper for generic RPC if needed
export async function rpc(functionName, payload) {
  return callEdgeFunction(functionName, payload);
}