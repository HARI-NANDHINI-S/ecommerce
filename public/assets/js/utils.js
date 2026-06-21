// public/assets/js/utils.js
// Small collection of reusable helpers for the SPA

/**
 * Debounce a function: ensures the wrapped function is only called after the
 * caller has stopped invoking it for `wait` milliseconds.
 */
export function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Format a numeric value as USD currency string.
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

/**
 * Simple helper to create an element with optional class and innerHTML.
 */
export function createEl(tag, className = '', html = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
}

/**
 * Serialize an object to pretty‑printed JSON for debugging.
 */
export function prettyPrint(obj) {
  return JSON.stringify(obj, null, 2);
}
