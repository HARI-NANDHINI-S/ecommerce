// public/assets/js/footer.js
// Footer component

export function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-column">
        <h3>About Us</h3>
        <p>Your trusted e-commerce store for premium products.</p>
      </div>
      
      <div class="footer-column">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#/shop">Shop</a></li>
          <li><a href="#/about">About</a></li>
          <li><a href="#/contact">Contact</a></li>
          <li><a href="#/privacy">Privacy Policy</a></li>
        </ul>
      </div>
      
      <div class="footer-column">
        <h3>Customer Service</h3>
        <ul>
          <li><a href="#/faq">FAQ</a></li>
          <li><a href="#/shipping">Shipping Info</a></li>
          <li><a href="#/returns">Returns</a></li>
          <li><a href="#/contact">Contact Us</a></li>
        </ul>
      </div>
      
      <div class="footer-column">
        <h3>Follow Us</h3>
        <div class="social-links">
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">Twitter</a>
          <a href="#" class="social-link">Instagram</a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2026 My Store. All rights reserved.</p>
      <p>Powered by Supabase + PayPal</p>
    </div>
  `;
}
