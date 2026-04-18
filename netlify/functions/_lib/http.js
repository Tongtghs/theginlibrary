export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function text(status, body, headers = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });
}

export function methodNotAllowed(allowed) {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { allow: allowed.join(", ") },
  });
}
