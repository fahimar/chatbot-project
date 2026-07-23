/**
 * pages/api/transcribe.js
 * ─────────────────────────────────────────────────────────────
 * FACES Health RAG Chatbot — Next.js API Proxy (voice input)
 * Forwards raw multipart audio to the FACES backend /transcribe.
 * Internal call — no public network hop; override with FACES_BACKEND_URL.
 * Audio is buffered in memory only, never written to disk.
 * ─────────────────────────────────────────────────────────────
 */

// bodyParser off: forward the multipart body untouched (boundary intact)
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const FACES_BASE_URL = process.env.FACES_BACKEND_URL || "http://localhost:8088";
const MAX_BYTES = 12 * 1024 * 1024; // matches nginx client_max_body_size 12m

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BYTES) {
      return res.status(413).json({ detail: "Recording is too large (max 12 MB)." });
    }
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);

  console.log(`[FACES API] POST /transcribe | ${Math.round(total / 1024)} KB`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${FACES_BASE_URL}/transcribe`, {
      method: "POST",
      headers: {
        "content-type": req.headers["content-type"] || "application/octet-stream",
        accept: "application/json",
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    // data = { text, duration, confidence, review_recommended } or { detail }
    return res.status(response.status).json(data);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("[FACES API] /transcribe failed:", error.message);

    if (error.name === "AbortError") {
      return res.status(504).json({ detail: "Transcription timed out. Try a shorter recording." });
    }
    return res.status(502).json({ detail: "Voice input is unavailable right now." });
  }
}
