/**
 * FACES Health RAG Chatbot — API Service
 *
 * POST /chat      → /api/chat          (Next.js proxy, custom 6-min timeout)
 * GET/DELETE      → /faces-api/*       (Next.js rewrite → 167.86.78.35:8088)
 *
 * No hardcoded external URLs in browser code.
 * Works on localhost AND Vercel without any changes.
 */

const SESSION_KEY = "faces_session_id";

// ─── Session Helpers ──────────────────────────────────────────────────────────

export function getSessionId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(id) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSessionId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

// ─── GET /sessions/{id}/history ───────────────────────────────────────────────
/**
 * Load chat history for a session.
 * Returns [] if session not found or expired.
 * @param {string} sessionId
 * @returns {{ question: string, answer: string }[]}
 */
export async function loadHistory(sessionId) {
  if (!sessionId) return [];

  try {
    const response = await fetch(
      `/faces-api/sessions/${sessionId}/history`,
      { headers: { accept: "application/json" } }
    );

    if (response.status === 404) return [];
    if (!response.ok) return [];

    const data = await response.json(); // { session_id, history, count }
    return data.history || [];
  } catch {
    return [];
  }
}

// ─── DELETE /sessions/{id}/history ───────────────────────────────────────────
/**
 * Clear history for a session (session stays alive).
 * Used for "New Chat" button.
 * @param {string} sessionId
 */
export async function clearHistory(sessionId) {
  if (!sessionId) return;
  try {
    await fetch(`/faces-api/sessions/${sessionId}/history`, {
      method: "DELETE",
      headers: { accept: "application/json" },
    });
  } catch {
    // Ignore cleanup errors
  }
}

// ─── DELETE /sessions/{id} ────────────────────────────────────────────────────
/**
 * Fully delete a session on page unload.
 * @param {string} sessionId
 */
export async function deleteSession(sessionId) {
  if (!sessionId) return;
  try {
    await fetch(`/faces-api/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { accept: "application/json" },
    });
  } catch {
    // Ignore cleanup errors
  }
}

// ─── GET /health ──────────────────────────────────────────────────────────────
/**
 * Health check — is the FACES API reachable?
 * @returns {{ status: string } | null}
 */
export async function checkHealth() {
  try {
    const response = await fetch("/faces-api/health", {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return { status: "degraded" };
    return await response.json();
  } catch {
    return { status: "degraded" };
  }
}
