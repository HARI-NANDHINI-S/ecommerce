// public/assets/js/navbar.js
// Navigation bar component

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const cartCount = localStorage.getItem('cart_count') || '0';
  
  navbar.innerHTML = `
    <div class="navbar-container">
      <div class="navbar-brand">
        <a href="#/" class="brand-link">
          <img id="store-logo" src="/assets/images/logo.png" alt="Store Logo" class="brand-logo" onerror="this.style.display='none'" />
          <span class="brand-name" data-store-name>My Store</span>
        </a>
      </div>
      
      <nav class="navbar-menu">
        <ul class="navbar-nav">
          <li><a href="#/shop" class="nav-link">Shop</a></li>
          <li><a href="#/about" class="nav-link">About</a></li>
          <li><a href="#/contact" class="nav-link">Contact</a></li>
        </ul>
      </nav>
      
      <div class="navbar-actions">
        <a href="#/cart" class="navbar-icon cart-icon">
          <span class="icon-label">🛒</span>
          <span class="cart-badge">${cartCount}</span>
        </a>
        <a href="#/profile" class="navbar-icon profile-icon">
          <span class="icon-label">👤</span>
        </a>
        <button class="theme-toggle" id="theme-toggle">🌙</button>
      </div>
    </div>
  `;

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
  }
}

// Update cart count in navbar
export function updateCartCount(count) {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = count;
  }
  localStorage.setItem('cart_count', count);
}
