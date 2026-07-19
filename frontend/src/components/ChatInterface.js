/**
 * ChatInterface.js
 * ─────────────────────────────────────────────────────────────
 * FACES Health RAG Chatbot — Main Chat UI
 * Uses FACES API via /api/chat proxy (Next.js API route)
 * Session ID stored in localStorage to persist across reloads
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import {
  getSessionId,
  setSessionId,
  clearSessionId,
  loadHistory,
  clearHistory,
} from "../lib/facesApi";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm your **FACES assistant** 👋\n\nI'm here to help with your treatments — I can share treatment info, pricing, or aftercare guidance. How can I help you today?",
  timestamp: new Date().toISOString(),
};

// Quick-reply starter chips shown under the welcome message
const STARTER_CHIPS = ["Aftercare advice", "Book a treatment", "Pricing"];

export default function ChatInterface() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [, setLocalSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null); // 'ok' | 'degraded' | null
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const waitTimerRef = useRef(null);
  // Ref mirrors sessionId state so async fetch closures always get latest value
  const sessionIdRef = useRef(null);

  // ── Wait-time counter while loading ──────────────────────────
  useEffect(() => {
    if (isLoading) {
      setWaitSeconds(0);
      waitTimerRef.current = setInterval(() => {
        setWaitSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(waitTimerRef.current);
      setWaitSeconds(0);
    }
    return () => clearInterval(waitTimerRef.current);
  }, [isLoading]);

  // ── Auto-scroll ───────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── On mount: restore session + load history ──────────────────
  useEffect(() => {
    async function restoreSession() {
      const storedId = getSessionId();
      if (!storedId) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const history = await loadHistory(storedId);

        if (history.length === 0) {
          // Session expired or empty — start fresh
          clearSessionId();
          setIsLoadingHistory(false);
          return;
        }

        // Convert FACES history format → our message format
        const restored = [];
        history.forEach((item) => {
          restored.push({ role: "user", content: item.question });
          restored.push({ role: "assistant", content: item.answer });
        });

        setMessages([WELCOME_MESSAGE, ...restored]);
        setLocalSessionId(storedId);
        sessionIdRef.current = storedId; // keep ref in sync
      } catch {
        clearSessionId();
        sessionIdRef.current = null;
      } finally {
        setIsLoadingHistory(false);
      }
    }

    restoreSession();
  }, []);

  // ── Clean up session on page unload (fire-and-forget) ─────────
  useEffect(() => {
    const handleUnload = () => {
      const id = getSessionId();
      if (id) {
        // Use Next.js rewrite path — works on localhost AND Vercel
        fetch(`/faces-api/sessions/${id}`, { method: "DELETE" });
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ── Send message ──────────────────────────────────────────────
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    setError(null);

    const userMessage = {
      role: "user",
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // AbortController for cancel support
    abortControllerRef.current = new AbortController();

    // 6 minute timeout to match server-side
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 360_000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: messageText.trim(),
          session_id: sessionIdRef.current, // always latest value — not stale state
          k: 5,
        }),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // First response returns a new session_id — save it immediately to ref + state + localStorage
      if (data.session_id && data.session_id !== sessionIdRef.current) {
        sessionIdRef.current = data.session_id;   // sync ref first (instant, no re-render)
        setLocalSessionId(data.session_id);        // update UI (header shows session id)
        setSessionId(data.session_id);             // persist to localStorage
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") return; // User cancelled

      console.error("[ChatInterface] sendMessage error:", err);
      const errMsg =
        err.message ||
        "Failed to connect to the AI service. Please try again.";
      setError(errMsg);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Sorry, I encountered an error: ${errMsg}`,
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // ── Cancel in-flight request ──────────────────────────────────
  const cancelRequest = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  // ── New Chat ──────────────────────────────────────────────────
  const handleNewChat = async () => {
    if (isLoading) cancelRequest();

    const currentId = getSessionId();
    if (currentId) {
      await clearHistory(currentId).catch(() => {});
    }
    clearSessionId();
    sessionIdRef.current = null; // reset ref
    setLocalSessionId(null);
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  };

  // ── Render ────────────────────────────────────────────────────
  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-[80vh] bg-white rounded-2xl shadow-lg items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#64748B]">
          <div className="w-10 h-10 border-4 border-[#E0FAFF] border-t-[#22D3EE] rounded-full animate-spin" />
          <p className="text-sm">Restoring your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] bg-[#F8FAFC] rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0]">
      {/* ── Chat header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          {/* Cyan heart-in-circle logo */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] flex items-center justify-center shadow-[0_4px_12px_rgba(6,182,212,0.35)]">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
              <path
                d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"
                fill="#fff"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight text-[#0F172A]">
              FACES Assistant
            </p>
            <p className="text-xs text-[#64748B] leading-tight flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-[#10B981] shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
              Here to help with your treatments
            </p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          disabled={isLoading}
          title="Start a new conversation"
          className="text-[13px] font-medium text-[#0891A6] bg-[#E0FAFF] hover:border-[#22D3EE] border border-transparent transition-colors px-3 py-1.5 rounded-full disabled:opacity-50"
        >
          + New Chat
        </button>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-grow overflow-y-auto p-4 space-y-1 bg-[#F8FAFC]">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {/* Quick-reply starter chips — shown only on the fresh welcome screen */}
        {messages.length === 1 && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-9 mb-2 motion-safe:animate-[fadeSlide_.2s_ease]">
            {STARTER_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="text-[13px] font-medium text-[#0891A6] bg-[#E0FAFF] border border-transparent px-3.5 py-2 rounded-full hover:border-[#22D3EE] active:bg-[#E0FAFF] transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Typing indicator — three cyan pulsing dots */}
        {isLoading && (
          <div className="flex items-end gap-2 mt-2">
            <div className="w-7 h-7 rounded-full bg-[#E0FAFF] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
                <path
                  d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"
                  fill="#22D3EE"
                />
              </svg>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-[4px] px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#22D3EE] rounded-full motion-safe:animate-[dotPulse_1.2s_infinite_ease-in-out]" />
                  <span className="w-2 h-2 bg-[#22D3EE] rounded-full motion-safe:animate-[dotPulse_1.2s_infinite_ease-in-out] [animation-delay:180ms]" />
                  <span className="w-2 h-2 bg-[#22D3EE] rounded-full motion-safe:animate-[dotPulse_1.2s_infinite_ease-in-out] [animation-delay:360ms]" />
                </div>
                <span className="text-xs text-[#64748B] ml-1">
                  {waitSeconds < 5
                    ? "Thinking…"
                    : waitSeconds < 30
                    ? `Searching knowledge base… ${waitSeconds}s`
                    : `Generating response… ${waitSeconds}s`}
                </span>
              </div>
            </div>
            <button
              onClick={cancelRequest}
              className="text-xs text-[#64748B] hover:text-[#EF4444] transition-colors underline ml-1"
            >
              cancel
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 mt-2">
            <span className="text-base">⚠️</span>
            <div>
              <p className="font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-400 hover:text-red-600 mt-0.5 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <MessageInput
        onSendMessage={sendMessage}
        onCancel={cancelRequest}
        isLoading={isLoading}
      />
    </div>
  );
}
