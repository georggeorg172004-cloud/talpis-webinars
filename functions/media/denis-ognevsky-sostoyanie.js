const OBJECT_KEY = "open-ether-denis-ognevsky-sostoyanie.mp4";

function parseRange(value) {
  if (!value || !value.startsWith("bytes=")) return null;
  const match = /^(\d*)-(\d*)$/.exec(value.slice(6).trim());
  if (!match) return null;
  const start = match[1] === "" ? null : Number(match[1]);
  const end = match[2] === "" ? null : Number(match[2]);
  if ((start !== null && !Number.isSafeInteger(start)) || (end !== null && !Number.isSafeInteger(end))) return null;
  if (start === null && end === null) return null;
  return { start, end };
}

function responseHeaders(object, range) {
  const headers = new Headers();
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("content-type", "video/mp4");
  headers.set("etag", object.httpEtag);
  headers.set("last-modified", object.uploaded.toUTCString());
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-expose-headers", "Accept-Ranges, Content-Length, Content-Range, ETag");
  if (range) {
    headers.set("content-range", `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`);
    headers.set("content-length", String(range.length));
  } else {
    headers.set("content-length", String(object.size));
  }
  return headers;
}

function normalizeRange(range, size) {
  if (!range) return null;
  if (range.start === null) {
    const length = Math.min(range.end, size);
    return length > 0 ? { offset: size - length, length } : null;
  }
  if (range.start >= size) return null;
  const end = range.end === null ? size - 1 : Math.min(range.end, size - 1);
  return end >= range.start ? { offset: range.start, length: end - range.start + 1 } : null;
}

export async function onRequest(context) {
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  }
  if (!context.env.VIDEOS) return new Response("Video storage unavailable", { status: 503 });

  const requestedRange = parseRange(context.request.headers.get("range"));
  const object = await context.env.VIDEOS.head(OBJECT_KEY);
  if (!object) return new Response("Not found", { status: 404 });

  const range = normalizeRange(requestedRange, object.size);
  if (requestedRange && !range) {
    return new Response(null, {
      status: 416,
      headers: { "content-range": `bytes */${object.size}`, "accept-ranges": "bytes", "cache-control": "no-store" }
    });
  }

  const bodyObject = context.request.method === "HEAD"
    ? object
    : await context.env.VIDEOS.get(OBJECT_KEY, range ? { range } : undefined);
  if (!bodyObject) return new Response("Not found", { status: 404 });

  const headers = responseHeaders(object, range);
  return new Response(context.request.method === "HEAD" ? null : bodyObject.body, {
    status: range ? 206 : 200,
    headers
  });
}
