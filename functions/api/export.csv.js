import { SECURITY_HEADERS, csvCell, fetchViewers, json, requireAdmin } from './_shared.js';

export async function onRequestGet(context) {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  let rows;
  try {
    rows = await fetchViewers(context.env);
  } catch (error) {
    return json({ error: error.message || 'Internal error' }, 500);
  }

  const header = ['Дата', 'Имя', 'Мэйл', 'Телефон', 'Страница', 'User Agent'];
  const lines = [header, ...rows.map((row) => [
    row.created_at || '',
    row.name || '',
    row.email || '',
    row.phone || '',
    row.video_page || '',
    row.user_agent || ''
  ])];
  const csv = lines.map((line) => line.map(csvCell).join(',')).join('\n');

  return new Response('\ufeff' + csv, {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="talpis-viewers-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
