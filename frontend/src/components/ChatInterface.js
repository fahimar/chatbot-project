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
    "👋 Hello! I'm the **FACES Health AI Assistant**.\n\nI can answer questions about our aesthetic treatments, including Botox, fillers, skin care, training courses, and more. How can I help you today?",
  timestamp: new Date().toISOString(),
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [sessionId, setLocalSessionId] = useState(null);
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
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-sm">Restoring your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* ── Chat header ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            F
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">FACES Health AI</p>
            <p className="text-xs text-rose-100 leading-tight">
              {sessionId
                ? `Session active · ${sessionId.slice(0, 8)}…`
                : "No active session"}
            </p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          disabled={isLoading}
          title="Start a new conversation"
          className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full font-medium disabled:opacity-50"
        >
          + New Chat
        </button>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-grow overflow-y-auto p-4 space-y-1 bg-gray-50">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              F
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-gray-400 ml-1">
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
              className="text-xs text-gray-400 hover:text-red-500 transition-colors underline ml-1"
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
