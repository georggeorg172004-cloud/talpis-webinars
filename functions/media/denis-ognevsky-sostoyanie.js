function disabledVideo() {
  return new Response("Video unavailable", {
    status: 410,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

export async function onRequestGet() {
  return disabledVideo();
}

export async function onRequestHead() {
  return disabledVideo();
}
