/**
 * pages/api/chat.js
 * ─────────────────────────────────────────────────────────────
 * FACES Health RAG Chatbot — Next.js API Proxy
 * Proxies /chat to the FACES backend on the same host (localhost:8088).
 * Internal call — no public network hop; override with FACES_BACKEND_URL.
 * ─────────────────────────────────────────────────────────────
 */

// Extend Next.js API route timeout to 6 minutes (default is 60s)
export const config = {
  api: {
    responseLimit: false,
    bodyParser: true,
  },
};

const FACES_BASE_URL = process.env.FACES_BACKEND_URL || "http://localhost:8088";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, session_id, k = 5 } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "question is required" });
  }

  console.log(`[FACES API] POST /chat | session: ${session_id || "new"}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 360_000); // 6 minutes

  try {
    const response = await fetch(`${FACES_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        question: question.trim(),
        session_id: session_id || null,
        k,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      console.error("[FACES API] Error response:", data);
      return res.status(response.status).json({
        error: data.detail || "FACES API error",
      });
    }

    // data = { answer, session_id }
    return res.status(200).json(data);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("[FACES API] Fetch failed:", error.message);

    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Request timed out (6 min). The AI model may be busy — please try again." });
    }

    return res.status(500).json({
      error: "Failed to reach FACES API",
      detail: error.message,
    });
  }
}
