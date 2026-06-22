// supabase/functions/verify-payment.js
// Server‑side PayPal payment verification (Edge Function)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// PayPal API endpoints
const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Generate PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PUBLIC_PAYPAL_KEY_ID}:${process.env.PAYPAL_SECRET_KEY}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Capture PayPal order
async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to capture PayPal order: ${response.statusText}`);
  }

  return await response.json();
}

export default async function handler(req, res) {
  try {
    const { paypal_order_id, paypal_payer_id } = req.body;
    if (!paypal_order_id) {
      return res.status(400).json({ error: 'Missing PayPal order ID' });
    }

    // Capture the PayPal order
    const captureResult = await capturePayPalOrder(paypal_order_id);

    if (captureResult.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'PayPal order capture failed', status: captureResult.status });
    }

    // Extract payment details
    const payment = captureResult.purchase_units[0].payments.captures[0];

    // Find the order by PayPal order ID
    const { data: orders, error: findErr } = await supabase
      .from('orders')
      .select('id, profile_id, total_amount')
      .eq('paypal_order_id', paypal_order_id);
    
    if (findErr || !orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Update order status to "paid"
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        paypal_payment_id: payment.id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select('*');
    
    if (updateErr) throw updateErr;

    // Insert payment record
    const { error: paymentErr } = await supabase
      .from('payments')
      .insert([{
        order_id: order.id,
        paypal_payment_id: payment.id,
        paypal_order_id: paypal_order_id,
        amount: order.total_amount,
        currency: payment.amount.currency_code,
        status: payment.status,
        method: 'paypal',
        captured_at: new Date().toISOString(),
        raw_payload: captureResult,
      }]);
    
    if (paymentErr) console.error('payment insert error', paymentErr);

    // Optionally decrement stock here
    // ... stock update logic ...

    return res.status(200).json({ 
      success: true, 
      order: updatedOrder[0],
      paymentId: payment.id,
    });
  } catch (e) {
    console.error('verify-payment error', e);
    return res.status(500).json({ error: 'Internal server error', message: e.message });
  }
}
