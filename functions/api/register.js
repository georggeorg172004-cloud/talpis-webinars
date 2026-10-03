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

export async function onRequestPost(context) {
  if (!context.env.DB) return json({ ok: false, error: "storage_unavailable" }, 503);

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const source = String(body.source || "relationship160926").trim().slice(0, 100) || "relationship160926";

  if (name.length < 2 || name.length > 120) return json({ ok: false, error: "invalid_name" }, 422);
  if (email.length > 200 || !EMAIL_RE.test(email)) return json({ ok: false, error: "invalid_email" }, 422);
  if (phone.length < 5 || phone.length > 40) return json({ ok: false, error: "invalid_phone" }, 422);

  try {
    await context.env.DB.prepare(
      "INSERT INTO leads (id, name, email, phone, source, consent_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), name, email, phone, source, new Date().toISOString()).run();
    return json({ ok: true });
  } catch (error) {
    console.error("lead_insert_failed", error?.message || "unknown_error");
    return json({ ok: false, error: "storage_error" }, 500);
  }
}
