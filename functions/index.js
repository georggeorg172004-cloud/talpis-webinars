function disabledPage() {
  return new Response(
    "<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Страница отключена</title></head><body style=\"margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0e;color:#f5f1ea;font:18px system-ui,sans-serif;text-align:center\"><main><h1>Страница отключена</h1><p>Веб-страница «Отношения без иллюзий» больше недоступна.</p></main></body></html>",
    {
      status: 410,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    }
  );
}

export async function onRequestGet() {
  return disabledPage();
}

export async function onRequestHead() {
  return disabledPage();
}
