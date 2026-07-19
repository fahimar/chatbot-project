/**
 * MessageInput.js
 * FACES composer — disclaimer strip + pill input with plus/attach icon and
 * cyan circular send button. Enter to send, Shift+Enter for newline.
 */

import { useState, useRef, useEffect } from "react";

const MAX_CHARS = 500;

export default function MessageInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && message.length <= MAX_CHARS) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter inserts newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const remaining = MAX_CHARS - message.length;
  const isOverLimit = remaining < 0;
  const canSend = message.trim() && !isLoading && !isOverLimit;

  return (
    <div className="bg-white border-t border-[#E2E8F0]">
      {/* Disclaimer strip */}
      <p className="text-[11px] text-[#64748B] text-center px-5 pt-2 leading-snug">
        General guidance only — your practitioner will confirm medical advice.
      </p>

      <form onSubmit={handleSubmit} className="px-3 py-2.5">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <button
            type="button"
            title="Add attachment"
            aria-label="Add attachment"
            className="w-10 h-10 rounded-full border border-[#E2E8F0] text-[#64748B] flex items-center justify-center shrink-0 hover:border-[#22D3EE] hover:text-[#06B6D4] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Pill input */}
          <div
            className={`relative flex-grow flex items-center bg-[#F8FAFC] border rounded-full transition-colors focus-within:border-[#22D3EE] ${
              isOverLimit ? "border-red-400" : "border-[#E2E8F0]"
            }`}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              className="w-full resize-none bg-transparent border-none rounded-full pl-4 pr-12 py-2.5 text-[15px] text-[#0F172A] placeholder-[#64748B] focus:outline-none"
              placeholder={
                isLoading ? "Waiting for response…" : "Ask about treatments…"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            {/* Character counter */}
            <span
              className={`absolute bottom-2.5 right-4 text-[10px] select-none ${
                isOverLimit
                  ? "text-red-500 font-semibold"
                  : remaining <= 50
                  ? "text-[#F59E0B]"
                  : "text-[#CBD5E1]"
              }`}
            >
              {remaining}
            </span>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!canSend}
            title="Send message (Enter)"
            aria-label="Send message"
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              canSend
                ? "bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] text-white shadow-[0_4px_12px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95"
                : "bg-[#E2E8F0] text-white/70 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              /* Send arrow icon */
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
