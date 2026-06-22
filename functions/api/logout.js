import { COOKIE_NAME, json } from './_shared.js';

export async function onRequestPost() {
  return json({ ok: true }, 200, {
    'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
  });
}
