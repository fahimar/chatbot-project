/**
 * pages/api/chat.js
 * ─────────────────────────────────────────────────────────────
 * FACES Health RAG Chatbot — Next.js API Proxy
 * Proxies all requests to http://167.86.78.35:8088
 * Local backend is intentionally unused.
 * ─────────────────────────────────────────────────────────────
 */

// Extend Next.js API route timeout to 6 minutes (default is 60s)
export const config = {
  api: {
    responseLimit: false,
    bodyParser: true,
    externalResolver: true, // tells Next.js an external service handles timing
  },
};

const FACES_BASE_URL = "http://167.86.78.35:8088";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, session_id, k = 5 } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "question is required" });
  }

  console.log(`[FACES API] POST /chat | session: ${session_id || "new"}`);

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
      // Node 18+ native fetch has no built-in timeout; use AbortController
      signal: AbortSignal.timeout(360_000), // 6 minutes (FACES RAG can be very slow)
    });

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
    console.error("[FACES API] Fetch failed:", error.message);

    if (error.name === "TimeoutError") {
      return res.status(504).json({ error: "Request timed out (6 min). The AI model may be busy — please try again." });
    }

    return res.status(500).json({
      error: "Failed to reach FACES API",
      detail: error.message,
    });
  }
}
