function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: { "www-authenticate": "Bearer", "cache-control": "no-store" }
  });
}

export async function onRequestGet(context) {
  const expected = context.env.LEADS_EXPORT_TOKEN;
  const authorization = context.request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!expected || !token || token !== expected) return unauthorized();
  if (!context.env.DB) return new Response("Storage unavailable", { status: 503 });

  const source = new URL(context.request.url).searchParams.get("source")?.trim() || "";
  if (source && !/^[a-z0-9_-]{1,100}$/i.test(source)) {
    return new Response("Invalid source", { status: 400, headers: { "cache-control": "no-store" } });
  }

  try {
    const result = source
      ? await context.env.DB.prepare(
          "SELECT created_at, name, email, phone, source FROM leads WHERE source = ? ORDER BY created_at DESC"
        ).bind(source).all()
      : await context.env.DB.prepare(
          "SELECT created_at, name, email, phone, source FROM leads ORDER BY created_at DESC"
        ).all();
    const rows = [
      ["Дата регистрации", "Имя", "Email", "Телефон", "Источник"],
      ...(result.results || []).map((lead) => [lead.created_at, lead.name, lead.email, lead.phone, lead.source])
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
    const filename = source ? `talpis-leads-${source}.csv` : "talpis-leads.csv";
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    console.error("lead_export_failed", error?.message || "unknown_error");
    return new Response("Export failed", { status: 500, headers: { "cache-control": "no-store" } });
  }
}
