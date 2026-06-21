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
      '': '/index.html',
      '#/': '/index.html',
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
    const path = routeMap[route] || '/error.html';
    fetch(path)
      .then((res) => res.text())
      .then((html) => {
        appContainer.innerHTML = html;
        // after injecting, allow page specific scripts to init
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event('pageLoaded'));
        }
      })
      .catch((err) => {
        console.error('Router load error:', err);
        appContainer.innerHTML = '<h2>Page not found</h2>';
      });
  }

  window.addEventListener('hashchange', () => loadPage(location.hash));
  // initial load
  loadPage(location.hash);
}

// Export initRouter for app.js to call on startup
