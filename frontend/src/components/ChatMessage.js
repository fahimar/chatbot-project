/**
 * ChatMessage.js
 * Renders a single chat bubble with avatar, timestamp, and basic markdown rendering.
 * FACES design: bot = white surface bubble (cyan heart avatar), user = cyan gradient bubble.
 */

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Small cyan heart-in-circle logo used as the assistant avatar. */
function FacesAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-[#E0FAFF] border border-[#E2E8F0] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
        <path
          d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"
          fill="#22D3EE"
        />
      </svg>
    </div>
  );
}

/**
 * Very lightweight markdown → JSX:
 * - **bold**
 * - newlines → <br />
 * - bullet lines starting with "- " or "• "
 */
function renderContent(text) {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, i) => {
    // Bullet list
    const isBullet = /^(\s*[-•]\s)/.test(line);
    const cleanLine = isBullet ? line.replace(/^(\s*[-•]\s)/, "") : line;

    // Bold (**text**)
    const parts = cleanLine.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="font-semibold">
          {part}
        </strong>
      ) : (
        part
      )
    );

    if (isBullet) {
      return (
        <li key={i} className="ml-4 list-disc leading-relaxed">
          {rendered}
        </li>
      );
    }

    return (
      <span key={i} className="block leading-relaxed">
        {rendered}
      </span>
    );
  });
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const time = formatTime(message.timestamp);

  return (
    <div
      className={`flex items-end gap-2 mb-3 motion-safe:animate-[fadeSlide_.2s_ease] ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Assistant avatar (user messages have none, per FACES design) */}
      {!isUser && <FacesAvatar />}

      {/* Bubble */}
      <div
        className={`flex flex-col gap-1 max-w-[78%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-3.5 py-2.5 text-[15px] leading-[1.5] ${
            isUser
              ? "bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] text-white rounded-2xl rounded-br-[4px] shadow-[0_4px_14px_rgba(6,182,212,0.32)]"
              : message.isError
              ? "bg-red-50 border border-red-100 text-red-700 rounded-2xl rounded-bl-[4px]"
              : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-2xl rounded-bl-[4px] shadow-sm"
          }`}
        >
          <div className={`${isList(message.content) ? "space-y-0.5" : ""}`}>
            {renderContent(message.content)}
          </div>
        </div>
        {time && (
          <span className="text-[11px] text-[#64748B] px-1">{time}</span>
        )}
      </div>
    </div>
  );
}

function isList(text) {
  return text && /\n\s*[-•]/.test(text);
}
