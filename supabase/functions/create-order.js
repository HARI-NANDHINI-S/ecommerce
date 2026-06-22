// supabase/functions/create-order.js
// Edge Function to create an order and PayPal order
// This runs with the Supabase service role key (never exposed to client)

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase admin client
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

// Create PayPal order
async function createPayPalOrder(amount, currency = 'USD') {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE',
            brand_name: process.env.PUBLIC_STORE_NAME || 'Store',
            locale: 'en-US',
            landing_page: 'LOGIN',
            return_url: `${process.env.PUBLIC_SITE_URL || 'http://localhost:5173'}/#/checkout`,
            cancel_url: `${process.env.PUBLIC_SITE_URL || 'http://localhost:5173'}/#/cart`,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create PayPal order: ${response.statusText}`);
  }

  return await response.json();
}

export default async function handler(req, res) {
  try {
    // Expect JSON body with cart_id (or list of items) and optional address_id
    const { cart_id, address_id, items } = req.body;
    
    // Get current user from auth header (Supabase JWT)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Unauthenticated' });

    // Resolve profile id from auth uid
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_uid', user.id)
      .single();
    if (profileErr) throw profileErr;

    // Fetch cart items for the profile
    const { data: cartItems, error: cartErr } = await supabase
      .from('cart_items')
      .select('product_variant_id, quantity')
      .eq('profile_id', profile.id);
    if (cartErr) throw cartErr;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of cartItems) {
      const { data: variant, error: varErr } = await supabase
        .from('product_variants')
        .select('price_adjust, product_id')
        .eq('id', item.product_variant_id)
        .single();
      if (varErr) throw varErr;

      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('price')
        .eq('id', variant.product_id)
        .single();
      if (prodErr) throw prodErr;

      const price = Number(product.price) + Number(variant.price_adjust);
      totalAmount += price * item.quantity;
    }

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(totalAmount, 'USD');

    // Insert order row (status pending)
    const { data: order, error: orderErr } = await supabase.from('orders').insert([
      {
        profile_id: profile.id,
        total_amount: totalAmount,
        currency: 'USD',
        paypal_order_id: paypalOrder.id,
        status: 'pending',
      },
    ]).select('id');
    if (orderErr) throw orderErr;

    // Insert order_items based on cart
    const orderId = order[0].id;
    const orderItems = cartItems.map((ci) => ({
      order_id: orderId,
      product_variant_id: ci.product_variant_id,
      quantity: ci.quantity,
      unit_price: 0, // placeholder; will be updated after verification
    }));
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) throw itemsErr;

    // Optionally clear cart
    await supabase.from('cart_items').delete().eq('profile_id', profile.id);

    // Respond with PayPal order information for client checkout
    return res.status(200).json({
      orderId,
      paypalOrderId: paypalOrder.id,
      amount: totalAmount,
      currency: 'USD',
      paypalStatus: paypalOrder.status,
    });
  } catch (e) {
    console.error('create-order error', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
