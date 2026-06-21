// public/assets/js/orderHistory.js
// Init order‑history page – displays a list of the user's past orders.

import { supabase } from './app.js';
import { rpc } from './api.js'; // generic RPC wrapper (or use a specific edge function)
import { createToast } from './toast.js';

export function initOrderHistory() {
  // Ensure user is logged in
  const { data: { user } } = supabase.auth.getUser();
  const container = document.getElementById('order-history');
  if (!container) return;
  if (!user) {
    container.innerHTML = '<p>Please <a href="#/login">log in</a> to view your orders.</p>';
    return;
  }

  // Fetch orders via admin edge function (or a dedicated user‑side function)
  rpc('admin-get-user-orders', { userId: user.id })
    .then((orders) => {
      if (!orders || orders.length === 0) {
        container.innerHTML = '<p>No orders found.</p>';
        return;
      }
      const list = document.createElement('ul');
      orders.forEach((order) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>Order #${order.id}</strong> – ${new Date(order.created_at).toLocaleDateString()} – $${order.total_amount}<br>
          Status: ${order.status}`;
        list.appendChild(li);
      });
      container.appendChild(list);
    })
    .catch((err) => {
      console.error('Failed to load orders', err);
      createToast('Failed to load order history', 'error');
    });
}
