const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = origin === "https://georggeorg172004-cloud.github.io";
  return allowed ? {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "vary": "Origin"
  } : {};
}

function corsResponse(request) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "cache-control": "no-store"
    }
  });
}

export async function onRequestOptions(context) {
  return corsResponse(context.request);
}

export async function onRequestPost(context) {
  if (!context.env.DB) return withCors(json({ ok: false, error: "storage_unavailable" }, 503), context.request);

  let body;
  try {
    body = await context.request.json();
  } catch {
    return withCors(json({ ok: false, error: "invalid_json" }, 400), context.request);
  }

  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const source = String(body.source || "relationship160926").trim().slice(0, 100) || "relationship160926";

  if (name.length < 2 || name.length > 120) return withCors(json({ ok: false, error: "invalid_name" }, 422), context.request);
  if (email.length > 200 || !EMAIL_RE.test(email)) return withCors(json({ ok: false, error: "invalid_email" }, 422), context.request);
  if (phone.length < 5 || phone.length > 40) return withCors(json({ ok: false, error: "invalid_phone" }, 422), context.request);

  try {
    await context.env.DB.prepare(
      "INSERT INTO leads (id, name, email, phone, source, consent_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), name, email, phone, source, new Date().toISOString()).run();
    return withCors(json({ ok: true }), context.request);
  } catch (error) {
    console.error("lead_insert_failed", error?.message || "unknown_error");
    return withCors(json({ ok: false, error: "storage_error" }, 500), context.request);
  }
}

function withCors(response, request) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}
