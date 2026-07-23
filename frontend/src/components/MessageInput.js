/**
 * MessageInput.js
 * FACES composer — disclaimer strip + pill input with plus/attach icon and
 * cyan circular send button. Enter to send, Shift+Enter for newline.
 * Voice input: mic button records → /api/transcribe → fills the box.
 * Never auto-sends — the user reviews and presses Send.
 */

import { useState, useRef, useEffect } from "react";

const MAX_CHARS = 500;
const MAX_RECORD_SECONDS = 60;
const DEFAULT_HINT =
  "General guidance only — your practitioner will confirm medical advice.";
const CONSENT_HINT =
  "Voice input is processed on our own servers and your recording is not stored.";

export default function MessageInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Voice input state
  const [micSupported, setMicSupported] = useState(false);
  const [recState, setRecState] = useState("idle"); // idle | recording | busy
  const [seconds, setSeconds] = useState(0);
  const [hint, setHint] = useState(null); // { text, isError } | null → default disclaimer
  const recorderRef = useRef(null);
  const tickerRef = useRef(null);

  // getUserMedia/MediaRecorder are browser-only — decide after mount (SSR safe)
  useEffect(() => {
    setMicSupported(
      !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)
    );
  }, []);

  // Release the mic (and its browser indicator) if the widget unmounts mid-recording
  useEffect(() => {
    return () => {
      clearInterval(tickerRef.current);
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
      setHint(null);
    }
  };

  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter inserts newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const stopTracks = () => {
    clearInterval(tickerRef.current);
    recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    setSeconds(0);
  };

  const startRecording = async () => {
    // Consent shown before the browser permission prompt
    setHint({ text: CONSENT_HINT, isError: false });

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      setHint({
        text:
          err?.name === "NotAllowedError"
            ? "Microphone access is blocked. Allow it in your browser settings, or type your question."
            : "No microphone found. Type your question instead.",
        isError: true,
      });
      return;
    }

    // Safari and iOS do not support webm — fall back to mp4
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/mp4";

    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      audioBitsPerSecond: 32000,
    });
    recorderRef.current = recorder;
    const chunks = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

    recorder.onstop = async () => {
      stopTracks();
      recorderRef.current = null;
      setRecState("busy");
      setHint({ text: "Converting your recording to text…", isError: false });

      const form = new FormData();
      form.append("audio", new Blob(chunks, { type: mime }), "input.webm");

      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Transcription failed.");

        setMessage(data.text); // fills the box — user presses Send
        requestAnimationFrame(() => {
          const ta = textareaRef.current;
          if (!ta) return;
          ta.focus();
          try {
            ta.setSelectionRange(data.text.length, data.text.length);
          } catch {}
        });

        setHint(
          data.review_recommended
            ? { text: "Check this matches what you said, then send.", isError: false }
            : null
        );
      } catch (err) {
        setHint({ text: err.message, isError: true });
      } finally {
        setRecState("idle");
      }
    };

    recorder.start();
    setRecState("recording");
    setHint({ text: "Recording — tap the square to stop.", isError: false });

    tickerRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= MAX_RECORD_SECONDS) stopRecorder();
        return next;
      });
    }, 1000);
  };

  // stop() throws if the recorder is already inactive (double-click, ticker race)
  const stopRecorder = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const handleMicClick = () => {
    if (recState === "recording") stopRecorder();
    else if (recState === "idle") startRecording();
  };

  const remaining = MAX_CHARS - message.length;
  const isOverLimit = remaining < 0;
  const canSend = message.trim() && !isLoading && !isOverLimit;
  const isRecording = recState === "recording";

  return (
    <div className="bg-white border-t border-[#E2E8F0]">
      {/* Disclaimer strip — doubles as the voice-input status line */}
      <p
        aria-live="polite"
        className={`text-[11px] text-center px-5 pt-2 leading-snug ${
          hint?.isError ? "text-red-500" : "text-[#64748B]"
        }`}
      >
        {hint ? hint.text : DEFAULT_HINT}
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

          {/* Recording timer */}
          {micSupported && isRecording && (
            <span
              role="timer"
              className="text-[12px] font-mono tabular-nums text-[#EF4444] select-none shrink-0 pb-3"
            >
              {`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}
            </span>
          )}

          {/* Mic button — hidden entirely when the browser can't record */}
          {micSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={recState === "busy" || isLoading}
              title={isRecording ? "Stop recording" : "Record your question"}
              aria-label={isRecording ? "Stop recording" : "Record your question"}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22D3EE] ${
                isRecording
                  ? "bg-[#EF4444] text-white"
                  : recState === "busy"
                  ? "border border-[#E2E8F0] text-[#06B6D4] cursor-not-allowed"
                  : isLoading
                  ? "border border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed"
                  : "border border-[#E2E8F0] text-[#64748B] hover:border-[#22D3EE] hover:text-[#06B6D4]"
              }`}
            >
              {isRecording ? (
                <>
                  {/* Pulse ring */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-2 border-[#EF4444] animate-ping motion-reduce:animate-none"
                  />
                  {/* Stop square */}
                  <span
                    aria-hidden="true"
                    className="w-3 h-3 rounded-[2px] bg-white"
                  />
                </>
              ) : recState === "busy" ? (
                <svg
                  className="animate-spin motion-reduce:animate-none w-4 h-4"
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
                /* Mic icon */
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              )}
            </button>
          )}

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
