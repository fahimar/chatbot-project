/**
 * MessageInput.js
 * Chat input bar — supports Enter to send, Shift+Enter for newline,
 * character counter, and loading state.
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
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-100 bg-white px-4 py-3"
    >
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            rows={1}
            className={`w-full resize-none border rounded-xl px-4 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors placeholder-gray-400 ${
              isOverLimit
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-200"
            }`}
            placeholder={
              isLoading ? "Waiting for response..." : "Ask about our treatments…"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          {/* Character counter */}
          <span
            className={`absolute bottom-2.5 right-3 text-[10px] select-none ${
              isOverLimit
                ? "text-red-500 font-semibold"
                : remaining <= 50
                ? "text-amber-500"
                : "text-gray-300"
            }`}
          >
            {remaining}
          </span>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
            canSend
              ? "bg-gradient-to-br from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-sm hover:shadow"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
          title="Send message (Enter)"
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
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="text-[10px] text-gray-300 mt-1.5 pl-1">
        Enter to send · Shift+Enter for new line · Response may take 5–25 sec
      </p>
    </form>
  );
}

