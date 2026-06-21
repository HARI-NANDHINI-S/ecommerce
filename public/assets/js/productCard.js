// public/assets/js/productCard.js
// Renders product cards on product.html and hooks add‑to‑cart buttons.

import { getProducts } from './api.js';
import { supabase } from './app.js';

// Simple cart helper – store in localStorage as JSON array of product IDs
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push({ id: product.id, quantity: 1, price: product.price });
  localStorage.setItem('cart', JSON.stringify(cart));
  // Dispatch a custom event so other modules can react
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function initProductCard() {
  // Only run on product page
  if (!document.getElementById('product-list')) return;

  getProducts()
    .then((products) => {
      const container = document.getElementById('product-list');
      container.innerHTML = '';
      products.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.image_url}" alt="${product.name}" class="product-image" />
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${formatCurrency(product.price)}</p>
          <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        container.appendChild(card);
      });
      // Attach click handlers
      container.querySelectorAll('.add-to-cart').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const id = Number(e.target.dataset.id);
          const product = (await getProducts()).find((p) => p.id === id);
          if (product) {
            addToCart(product);
            showToast('Added to cart');
          }
        });
      });
    })
    .catch((err) => console.error('Failed to load products', err));
}

// Helper for currency formatting – reused from utils if available
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// Simple toast helper – expects toast module to expose showToast globally
function showToast(message) {
  if (window.showToast) window.showToast(message);
}
