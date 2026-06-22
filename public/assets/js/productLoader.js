// public/assets/js/productLoader.js
// Load and render products from database

const ENV = window.ENV || {};
const USE_MOCK_API = ENV.USE_MOCK_API === true || ENV.USE_MOCK_API === 'true';

// Mock products
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Premium Headphones',
    description: 'High-quality wireless headphones',
    price: 99.99,
    image_url: 'https://via.placeholder.com/300x300?text=Headphones',
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Smartwatch',
    description: 'Feature-rich smartwatch',
    price: 199.99,
    image_url: 'https://via.placeholder.com/300x300?text=Smartwatch',
    category: 'Electronics'
  },
  {
    id: 3,
    name: 'Wireless Speaker',
    description: 'Portable Bluetooth speaker',
    price: 49.99,
    image_url: 'https://via.placeholder.com/300x300?text=Speaker',
    category: 'Electronics'
  },
  {
    id: 4,
    name: 'USB-C Cable',
    description: 'Durable USB-C charging cable',
    price: 14.99,
    image_url: 'https://via.placeholder.com/300x300?text=Cable',
    category: 'Accessories'
  }
];

// Get Supabase client
async function getSupabase() {
  let attempts = 0;
  while (!window.supabase && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  return window.supabase;
}

// Fetch products
export async function loadProducts() {
  if (USE_MOCK_API) {
    console.log('[MOCK] Loading products');
    return MOCK_PRODUCTS;
  }

  try {
    const supabase = await getSupabase();
    if (!supabase) {
      console.warn('Supabase not initialized, using mock products');
      return MOCK_PRODUCTS;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(12);

    if (error) {
      console.warn('Error loading products:', error);
      return MOCK_PRODUCTS;
    }

    return data || MOCK_PRODUCTS;
  } catch (e) {
    console.warn('Exception loading products:', e);
    return MOCK_PRODUCTS;
  }
}

// Render product grid
export async function renderProductGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const products = await loadProducts();
    
    if (!products || products.length === 0) {
      container.innerHTML = '<p>No products available</p>';
      return;
    }

    container.innerHTML = products
      .slice(0, 4)
      .map(product => `
        <div class="product-card">
          <div class="product-image">
            <img 
              src="${product.image_url || 'https://via.placeholder.com/300x300'}" 
              alt="${product.name}"
              onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'"
            />
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description || ''}</p>
            <div class="product-footer">
              <span class="product-price">$${(product.price || 0).toFixed(2)}</span>
              <button class="btn-secondary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
          </div>
        </div>
      `)
      .join('');

    // Attach event listeners
    container.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        addToCart(productId, products);
      });
    });
  } catch (e) {
    console.error('Error rendering products:', e);
    container.innerHTML = '<p>Error loading products</p>';
  }
}

// Add product to cart
function addToCart(productId, products) {
  const product = products.find(p => p.id == productId);
  if (!product) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = cartCount;
  }
  
  // Show toast
  if (window.showToast) {
    window.showToast(`${product.name} added to cart!`);
  }
}
