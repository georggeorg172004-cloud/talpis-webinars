export const COOKIE_NAME = 'talpis_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Cache-Control': 'no-store'
};

export async function requireAdmin(request, env) {
  const cookie = getCookie(request.headers.get('Cookie') || '', COOKIE_NAME);
  if (!cookie) return { ok: false, response: json({ error: 'Unauthorized' }, 401) };

  const [expires, sig] = cookie.split('.');
  if (!expires || !sig) return { ok: false, response: json({ error: 'Unauthorized' }, 401) };
  if (Number(expires) < Math.floor(Date.now() / 1000)) {
    return { ok: false, response: json({ error: 'Session expired' }, 401) };
  }

  const expected = await sign(expires, env.SESSION_SECRET || '');
  if (!constantTimeEqual(sig, expected)) return { ok: false, response: json({ error: 'Unauthorized' }, 401) };

  return { ok: true };
}

export async function fetchViewers(env) {
  const endpoint = `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/viewers?select=created_at,name,email,phone,video_page,user_agent&order=created_at.desc&limit=5000`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error ${response.status}: ${text}`);
  }

  return response.json();
}

export async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(String(left || ''));
  const b = new TextEncoder().encode(String(right || ''));
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (a[i] || 0) ^ (b[i] || 0);
  }
  return diff === 0;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getCookie(header, name) {
  return header.split(';').map((part) => part.trim()).reduce((found, part) => {
    if (found) return found;
    const index = part.indexOf('=');
    if (index === -1) return '';
    return part.slice(0, index) === name ? part.slice(index + 1) : '';
  }, '');
}

export function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}
