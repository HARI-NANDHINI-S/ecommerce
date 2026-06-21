// supabase/functions/verify-payment.js
// Server‑side Razorpay payment verification (Edge Function)

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Compute expected signature using secret key (never exposed to client)
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Timing‑safe compare
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update order status to "paid"
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .single();
    if (error) throw error;

    return res.status(200).json({ success: true, order: data });
  } catch (e) {
    console.error('verify-payment error', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
