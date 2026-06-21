// public/assets/js/cart.js
// Renders the shopping‑cart UI, syncs with localStorage, and dispatches cart updates.

import { formatCurrency } from './utils.js';

function loadCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return; // not on cart page
  const cart = loadCart();
  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  const table = document.createElement('table');
  table.className = 'cart-table';
  table.innerHTML = `
    <thead>
      <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th><th>Actions</th></tr>
    </thead>
    <tbody></tbody>
    <tfoot></tfoot>
  `;
  const tbody = table.querySelector('tbody');
  let grandTotal = 0;
  cart.forEach((item, idx) => {
    const row = document.createElement('tr');
    const total = item.price * item.quantity;
    grandTotal += total;
    row.innerHTML = `
      <td>${item.id}</td>
      <td><input type="number" min="1" value="${item.quantity}" data-index="${idx}" class="qty-input"/></td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(total)}</td>
      <td><button data-index="${idx}" class="remove-btn">Remove</button></td>
    `;
    tbody.appendChild(row);
  });
  const tfoot = table.querySelector('tfoot');
  tfoot.innerHTML = `<tr><td colspan="3">Grand Total</td><td colspan="2">${formatCurrency(grandTotal)}</td></tr>`;
  container.innerHTML = '';
  container.appendChild(table);

  // Attach event listeners
  container.querySelectorAll('.qty-input').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const index = Number(e.target.dataset.index);
      const qty = Math.max(1, Number(e.target.value));
      const cart = loadCart();
      cart[index].quantity = qty;
      saveCart(cart);
      renderCart();
    });
  });
  container.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.target.dataset.index);
      const cart = loadCart();
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });
  });
}

export function initCart() {
  renderCart();
  // Listen for external updates (e.g., product card add‑to‑cart)
  window.addEventListener('cartUpdated', renderCart);
}
