// public/assets/js/checkout.js
// Handles checkout page: cart validation, order creation via API, Razorpay integration

import { createOrder, verifyPayment } from './api.js';
import { getCartItems, clearCart } from './cart.js';
import { showToast } from './toast.js';

export function initCheckout() {
  const checkoutBtn = document.getElementById('checkout-btn');
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener('click', async () => {
    const items = getCartItems();
    if (items.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    try {
      const orderPayload = { items };
      const orderResp = await createOrder(orderPayload);
      // Assuming orderResp contains Razorpay order_id and key_id
      const rzp = new Razorpay({
        key: orderResp.key_id,
        order_id: orderResp.order_id,
        handler: async function (response) {
          // Verify payment server‑side
          await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          showToast('Payment successful! Order placed.', 'success');
          clearCart();
          // Optionally redirect to order‑details page
          location.hash = '#/order';
        },
      });
      rzp.open();
    } catch (e) {
      console.error(e);
      showToast('Checkout failed. Please try again.', 'error');
    }
  });
}
