export default {
  async scheduled(_controller, env) {
    const endpoint = String(env.CLEANUP_ENDPOINT || "").trim();
    const secret = String(env.STORY_CLEANUP_SECRET || "");
    if (!endpoint || !secret) {
      throw new Error("Missing CLEANUP_ENDPOINT or STORY_CLEANUP_SECRET Worker variable.");
    }

    const url = new URL(endpoint);
    if (url.protocol !== "https:" || !url.pathname.endsWith("/api/cleanup-stories")) {
      throw new Error("CLEANUP_ENDPOINT must be the HTTPS Pages URL ending in /api/cleanup-stories.");
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Cache-Control": "no-store"
      }
    });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Story cleanup endpoint returned HTTP ${response.status}: ${body.slice(0, 300)}`);
    }

    let result;
    try { result = JSON.parse(body); }
    catch { throw new Error("Story cleanup endpoint did not return valid JSON."); }
    if (result?.ok !== true) {
      throw new Error(`Story cleanup did not complete successfully: ${body.slice(0, 300)}`);
    }
  }
};
