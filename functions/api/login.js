import { COOKIE_NAME, SESSION_TTL_SECONDS, constantTimeEqual, json, sha256, sign, sleep } from './_shared.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || '');

  if (!env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return json({ error: 'Server is not configured' }, 500);
  }

  if (!constantTimeEqual(await sha256(password), env.ADMIN_PASSWORD_HASH)) {
    await sleep(350);
    return json({ error: 'Wrong password' }, 401);
  }

  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const sig = await sign(String(expires), env.SESSION_SECRET);
  const value = `${expires}.${sig}`;

  return json({ ok: true }, 200, {
    'Set-Cookie': `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`
  });
}
