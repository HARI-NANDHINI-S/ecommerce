// public/assets/js/toast.js
// Simple toast UI – shows temporary messages in the corner.

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '10000';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '8px';
    document.body.appendChild(toastContainer);
  }
}

export function showToast(message, type = 'info', duration = 3000) {
  ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.minWidth = '200px';
  toast.style.padding = '12px 16px';
  toast.style.background = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#333';
  toast.style.color = '#fff';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    if (toastContainer.children.length === 0) toastContainer.remove();
  }, duration);
}

// expose globally for other modules that may not import directly
window.showToast = showToast;
