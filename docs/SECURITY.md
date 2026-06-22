# SECURITY.md

## Threat Model
- **Secrets exposure** – Supabase `service_role` key and PayPal secret key are stored only in server‑side Edge Functions and never sent to the browser.
- **Cross‑Site Scripting (XSS)** – All user‑generated content is escaped via `escapeHTML` before insertion into the DOM. File uploads are restricted to image MIME types and filenames are sanitized.
- **Cross‑Site Request Forgery (CSRF)** – All state‑changing requests are made with Supabase JWT in the `Authorization` header; browsers automatically send the token only to our origin.
- **SQL Injection** – All queries use Supabase client parameter binding; no raw string concatenation.
- **Denial‑of‑Service (DoS)** – Rate‑limiting implemented in Edge Functions via a simple token‑bucket stored in a `rate_limits` table.

## Security Headers (Vercel)
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {"key":"Content‑Security‑Policy","value":"default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.paypal.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.paypal.com https://www.paypal.com;"},
      {"key":"X‑Content‑Type‑Options","value":"nosniff"},
      {"key":"Referrer‑Policy","value":"strict-origin-when-cross-origin"},
      {"key":"Permissions‑Policy","value":"geolocation=(), microphone=()"},
      {"key":"X‑Frame‑Options","value":"SAMEORIGIN"}
    ]
  }]
}
```

## Auditing & Monitoring
- Supabase logs all RLS‑denied attempts.
- PayPal webhooks include signature verification; failed attempts are logged.
- Vercel provides request logs; set alerts for abnormal traffic spikes.

## Incident Response
1. Revoke compromised keys immediately (Supabase service‑role, PayPal secret key).
2. Rotate JWT secret in Supabase > Settings > JWT > Secret.
3. Deploy updated Edge Functions with new secrets.
4. Notify affected users via email.
