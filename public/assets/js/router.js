// public/assets/js/router.js
// Simple hash‑based SPA router
// Maps routes to HTML partials and injects them into #app container

export function initRouter() {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('Router: #app container not found');
    return;
  }

  function loadPage(route) {
    const routeMap = {
      '': '/home.html',
      '#/': '/home.html',
      '#/shop': '/shop.html',
      '#/product': '/product.html',
      '#/cart': '/cart.html',
      '#/checkout': '/checkout.html',
      '#/login': '/login.html',
      '#/profile': '/profile.html',
      '#/order': '/order-details.html',
      '#/settings': '/settings.html',
      '#/about': '/about.html',
      '#/contact': '/contact.html',
      '#/admin': '/admin-dashboard.html',
    };
    
    const path = routeMap[route] || '/home.html';
    
    // Show loading indicator
    appContainer.innerHTML = '<div class="loading">Loading...</div>';
    
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.text();
      })
      .then((html) => {
        appContainer.innerHTML = html;
        // Scroll to top
        window.scrollTo(0, 0);
        // after injecting, allow page specific scripts to init
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event('pageLoaded'));
        }
      })
      .catch((err) => {
        console.error('Router load error:', err);
        appContainer.innerHTML = '<div class="error"><h2>Error loading page</h2><p>' + err.message + '</p><a href="#/">Back to Home</a></div>';
      });
  }

  // Handle hash changes
  window.addEventListener('hashchange', () => loadPage(location.hash));
  
  // Initial load
  if (!location.hash) {
    location.hash = '#/';
  } else {
    loadPage(location.hash);
  }
}

// Export initRouter for app.js to call on startup
