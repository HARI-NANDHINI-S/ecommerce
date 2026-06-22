// public/assets/js/checkout.js
// Handles checkout page: cart validation, order creation via API, PayPal integration

import { createOrder, verifyPayment } from './api.js';
import { getCartItems, clearCart } from './cart.js';
import { showToast } from './toast.js';

// Load PayPal SDK dynamically
function loadPayPalSDK() {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }

    // Get PayPal client ID from environment or window variable
    const clientId = window.PAYPAL_CLIENT_ID;
    
    if (!clientId) {
      console.error('PayPal Client ID not found');
      reject(new Error('PayPal Client ID not configured'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(script);
  });
}

export async function initCheckout() {
  const paypalContainer = document.getElementById('paypal-button-container');
  
  if (!paypalContainer) return;

  try {
    // Load PayPal SDK first
    await loadPayPalSDK();

    // Initialize PayPal buttons
    paypal.Buttons({
      createOrder: async function(data, actions) {
        try {
          const items = getCartItems();
          if (items.length === 0) {
            showToast('Your cart is empty.', 'error');
            throw new Error('Cart is empty');
          }
          
          // Call backend to create order
          const orderPayload = { items };
          const orderResp = await createOrder(orderPayload);
          
          return orderResp.paypalOrderId;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          showToast('Failed to create order. Please try again.', 'error');
          throw error;
        }
      },
      
      onApprove: async function(data, actions) {
        try {
          // Verify payment server-side
          await verifyPayment({
            paypal_order_id: data.orderID,
            paypal_payer_id: data.payerID,
          });
          
          showToast('Payment successful! Order placed.', 'success');
          clearCart();
          
          // Redirect to order details page
          setTimeout(() => {
            location.hash = '#/order';
          }, 1500);
        } catch (error) {
          console.error('Error verifying payment:', error);
          showToast('Payment verification failed. Please contact support.', 'error');
        }
      },
      
      onError: function(err) {
        console.error('PayPal error:', err);
        showToast('Payment failed. Please try again.', 'error');
      },
      
      onCancel: function(data) {
        showToast('Payment cancelled.', 'warning');
      }
    }).render('#paypal-button-container').catch(error => {
      console.error('Error rendering PayPal buttons:', error);
      showToast('Payment gateway loading failed. Please refresh the page.', 'error');
    });
  } catch (error) {
    console.error('Checkout initialization error:', error);
    showToast('Failed to initialize checkout. Please refresh the page.', 'error');
  }
}
