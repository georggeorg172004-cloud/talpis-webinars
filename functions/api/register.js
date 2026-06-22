const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return json({ error: 'Server is not configured' }, 500);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return json({ error: 'Invalid request body' }, 400);
  }

  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 160).toLowerCase();
  const phone = cleanText(body.phone, 80);
  const videoPage = cleanText(body.video_page, 500);
  const userAgent = cleanText(body.user_agent || request.headers.get('User-Agent') || '', 500);

  if (!name || !isEmail(email) || !phone) {
    return json({ error: 'Name, email and phone are required' }, 400);
  }

  const endpoint = `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/viewers`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      video_page: videoPage,
      user_agent: userAgent
    })
  });

  if (!response.ok) {
    return json({ error: 'Registration failed' }, 502);
  }

  return json({ ok: true });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      ...JSON_HEADERS,
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}
