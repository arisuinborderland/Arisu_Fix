import { validateStoryImage } from "../functions/lib/story-image-jSquash.js";

function decodeBase64(value) {
  const binary = atob(String(value || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export default {
  async fetch(request) {
    if (request.method === "GET" && new URL(request.url).pathname === "/health") {
      return new Response("ok");
    }
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "A valid JSON body is required." }, { status: 400 });
    }

    let bytes;
    try {
      bytes = decodeBase64(body?.base64);
    } catch {
      return Response.json({ ok: false, status: 415, error: "Invalid base64." }, { status: 415 });
    }

    const result = await validateStoryImage(body?.mimeType, bytes);
    return Response.json(result, { status: result.ok ? 200 : result.status });
  }
};
