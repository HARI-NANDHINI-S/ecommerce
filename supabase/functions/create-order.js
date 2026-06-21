// supabase/functions/create-order.js
// Edge Function to create an order and Razorpay order
// This runs with the Supabase service role key (never exposed to client)

import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Initialize Razorpay SDK (server side)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_SECRET, // using secret key for server SDK
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  try {
    // Expect JSON body with cart_id (or list of items) and optional address_id
    const { cart_id, address_id } = req.body;
    if (!cart_id) {
      return res.status(400).json({ error: 'cart_id required' });
    }

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

    // Calculate total amount (in smallest currency unit, e.g., paise)
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

    // Convert to smallest unit (e.g., cents) – assume currency has 2 decimals
    const amountCents = Math.round(totalAmount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountCents,
      currency: 'INR', // could be dynamic based on store_settings
      receipt: crypto.randomUUID(),
      payment_capture: 1,
    });

    // Insert order row (status pending)
    const { data: order, error: orderErr } = await supabase.from('orders').insert([
      {
        profile_id: profile.id,
        total_amount: totalAmount,
        currency: 'INR',
        razorpay_order_id: razorpayOrder.id,
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

    // Respond with Razorpay order information for client checkout
    return res.status(200).json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: amountCents,
      currency: 'INR',
      publicKey: process.env.PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error('create-order error', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
