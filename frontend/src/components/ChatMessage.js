/**
 * ChatMessage.js
 * Renders a single chat bubble with avatar, timestamp, and basic markdown rendering.
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
      className={`flex items-end gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          F
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          U
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 text-sm shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-sm"
              : message.isError
              ? "bg-red-50 border border-red-100 text-red-700 rounded-2xl rounded-bl-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
          }`}
        >
          <div className={`${isList(message.content) ? "space-y-0.5" : ""}`}>
            {renderContent(message.content)}
          </div>
        </div>
        {time && (
          <span className="text-[10px] text-gray-400 px-1">{time}</span>
        )}
      </div>
    </div>
  );
}

function isList(text) {
  return text && /\n\s*[-•]/.test(text);
}

