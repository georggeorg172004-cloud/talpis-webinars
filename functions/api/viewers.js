import { fetchViewers, json, requireAdmin } from './_shared.js';

export async function onRequestGet(context) {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const rows = await fetchViewers(context.env);
    return json({ rows });
  } catch (error) {
    return json({ error: error.message || 'Internal error' }, 500);
  }
}
