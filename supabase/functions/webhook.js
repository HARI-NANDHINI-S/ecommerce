// supabase/functions/webhook.js
// Razorpay webhook handler – verifies signature, stores payment, updates order, decrements stock

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  const signature = event.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = await event.text();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  if (expected !== signature) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const payload = JSON.parse(rawBody);
  const payment = payload.payload.payment.entity;
  const orderId = payment.notes?.order_id;
  if (!orderId) {
    return new Response(JSON.stringify({ error: "Missing order_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Insert payment record
  const { error: payErr } = await supabase.from("payments").insert({
    order_id: orderId,
    razorpay_payment_id: payment.id,
    amount: payment.amount / 100,
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    captured_at: payment.captured_at,
    raw_payload: payment,
  });
  if (payErr) {
    console.error("payment insert error", payErr);
    return new Response(JSON.stringify({ error: payErr.message }), { status: 500 });
  }
  // Mark order as paid if captured
  if (payment.status === "captured") {
    await supabase.from("orders").update({ status: "paid", paid_at: new Date() }).eq("id", orderId);
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
